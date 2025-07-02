import {Story, updateStory, UpdateStoryAction} from "../../../../../store/stories";
import _ from "lodash";
import DelayTaskUtil from "../../../../../util/DelayTaskUtil";
import {Character, CharacterSetting, EditCharOption} from "./character-typedef";
import EvtMgr, {EventName} from "../../../../../common/evt-mgr";
import StringUtil from "../../../../../util/StringUtil";
import AppConfig from "../../../../../app-config";
import {CommandType} from "../../../../../common/passage-command/PassageCommandTypeDef";

export class CharacterMgr {
	private static storyId: string = '';
	private static characters: Character[] = [];
	private static _nextId: number;
	private static _updateVersion: number = NaN;

	static get charactersCount(): number {
		return this.characters?.length || 0;
	}

	static get(characterId: number): Character | undefined {
		return this.characters.find(anyC => anyC.id === characterId);
	}

	static getByIndex(characterIndex: number): Character | undefined {
		return this.characters[characterIndex];
	}

	static get updateVersion (): number {
		return this._updateVersion;
	}

	static reloadCharacterSetting(characterSetting: CharacterSetting, storyId: string | undefined) {

		let storyIdIsDifferent = _.isNil(storyId) || this.storyId !== storyId;
		let outDated = isNaN(this._updateVersion) || this._updateVersion < characterSetting.updateVersion

		let needReload = storyIdIsDifferent || outDated
		if (needReload) {
			this.storyId = storyId || '';
			this.characters = _.isArray(characterSetting.characters) ? characterSetting.characters : [];
			this._updateVersion = Number(characterSetting.updateVersion) || 0;
			this._afterLoad();
			return;
		}

		if (AppConfig.isDev())
			console.log('need not reloadCharacterSetting');
	}

	static clear() {
		this.storyId = '';
		this.characters = [];
		this._updateVersion = NaN;
	}

	static getAlls(): Character[] {
		if (!this.characters.length) {
			this.characters = [];
		}
		return this.characters;
	}

	private static _afterLoad() {
		let all = this.characters;

		this._nextId = 0;
		if (!all.length) {
			return [];
		}

		let allIds: Set<string | number> = new Set();
		const charWithBiggestId = all.reduce((curMaxChar, eachChar) => {
			if (allIds.has(eachChar.id)) {
				console.warn('Character has duplicate id', eachChar.id, eachChar, 'all: ', this.characters);
			}
			allIds.add(eachChar.id);
			let curMaxId = Number(curMaxChar.id);
			let curId = Number(eachChar.id);
			return curMaxId > curId ? curMaxChar : eachChar;
		});

		let biggestId = Number(charWithBiggestId?.id);
		if (isNaN(biggestId)) {
			console.error('No way biggestId is non number', biggestId, 'from charWithBiggestId', charWithBiggestId);
		} else {
			this._nextId = biggestId + 1;
		}
	}

	static nextId(): number {
		return ++this._nextId;
	}

	static addCharacter(option: Omit<Character, 'id'> & {
		stories: Story[],
		story: Story,
		dispatchStory: (updateStoryAction: UpdateStoryAction) => void
	}) {
		let newChar: Character = {
			id: this.nextId(),
			displayName: option.displayName,
			imgUrl: option.imgUrl,
			skins: option.skins,
		};

		this.characters.push(newChar);
		let nextUpdateVersion = (Number(this._updateVersion) || 0) + 1;
		let newCharacterSetting: CharacterSetting = {
			updateVersion: nextUpdateVersion,
			characters: this.characters,
		}

		let newStorySetting = option.story.storySetting;
		newStorySetting.characterSetting = newCharacterSetting;

		console.log('force reload characterSetting..', newStorySetting,
			'nextUpdateVersion', nextUpdateVersion,
			'cur updateVersion', this.updateVersion,
			'option', option
		);

		option.dispatchStory(
			updateStory(option.stories, option.story, {
				storySetting: newStorySetting,
			})
		)
		EvtMgr.emit(EventName.characterChange);
		return newChar;
	}


	static removeCharacter(option: {
		stories: Story[];
		dispatchStory: (updateStoryAction: UpdateStoryAction) => void
		characterIndex: any;
		story: Story
	}) {
		if (!this.characters[option.characterIndex]) {
			console.error('Nothing at character index ', option.characterIndex, 'cant remove anything');
			return;
		}

		this.characters.splice(option.characterIndex, 1);
		let nextUpdateVersion = (Number(this._updateVersion) || 0) + 1;
		let newCharacterSetting: CharacterSetting = {
			updateVersion: nextUpdateVersion,
			characters: this.characters,
		}

		let newStorySetting = option.story.storySetting;
		newStorySetting.characterSetting = newCharacterSetting;
		EvtMgr.emit(EventName.characterChange);
		option.dispatchStory(
			updateStory(option.stories, option.story, {
				storySetting: newStorySetting,
			})
		)
	}

	static editChar(args: EditCharOption) {
		const {characterIndex, stories, story, dispatchStory} = args;
		const delayS = args.delayS;

		let oldChar = this.characters[characterIndex];
		if (!oldChar) {
			console.error('cant editChar cuz no such char at characterIndex', characterIndex);
			return;
		}

		// Create new character with updated properties
		const newChar = this.updateCharacterProperties(oldChar, args);
		
		// Save old display name before updating character
		const oldDisplayName = oldChar.displayName;
		const newDisplayName = newChar.displayName;

		// Update character in the array
		this.characters[characterIndex] = newChar;
		
		// Update character settings in the story
		const newStorySetting = this.updateCharacterSettings(story);
		
		// Update character name references in all passages if name changed
		if (oldDisplayName !== newDisplayName) {
			this.updateCharacterNameInPassages(story, oldDisplayName, newDisplayName);
		}

		// Dispatch updates either immediately or with delay
		this.dispatchCharacterUpdates(stories, story, newStorySetting, dispatchStory, delayS);

		return newChar;
	}

	/**
	 * Updates character properties based on the edit options
	 */
	private static updateCharacterProperties(oldChar: Character, args: EditCharOption): Character {
		let newChar = {...oldChar};
		let charEditOption: Partial<EditCharOption> = {...args};
		
		// Remove non-character properties from edit options
		delete charEditOption.stories;
		delete charEditOption.story;
		delete charEditOption.dispatchStory;
		delete charEditOption.characterIndex;
		delete charEditOption.delayS;

		// Apply all remaining properties to character
		Object.entries(charEditOption).forEach(([key, value]) => {
			newChar[key] = value;
		});

		return newChar;
	}

	/**
	 * Updates character settings in the story
	 */
	private static updateCharacterSettings(story: Story) {
		// Increment version number
		let nextUpdateVersion = (Number(this._updateVersion) || 0) + 1;
		
		// Create new character settings
		let newCharacterSetting: CharacterSetting = {
			updateVersion: nextUpdateVersion,
			characters: this.characters,
		};

		// Update version to prevent unnecessary reloading
		this._updateVersion = nextUpdateVersion;

		// Apply new settings to story
		let newStorySetting = {...story.storySetting};
		newStorySetting.characterSetting = newCharacterSetting;
		
		return newStorySetting;
	}

	/**
	 * Updates character name references in all commands across all passages
	 */
	private static updateCharacterNameInPassages(story: Story, oldDisplayName: string, newDisplayName: string) {
		// Loop through all passages in story
		story.passages.forEach(passage => {
			let needUpdatePassage = false;
			
			// Check and update commands in passage
			passage.commands.forEach(command => {
				// Update for CharacterDialog
				if (command.type === CommandType.characterDialog && command.content?.characterName === oldDisplayName) {
					command.content.characterName = newDisplayName;
					needUpdatePassage = true;
				}
				
				// Update for CharacterShow
				if (command.type === CommandType.characterShow && command.content?.toShowTarget === oldDisplayName) {
					command.content.toShowTarget = newDisplayName;
					needUpdatePassage = true;
				}
			});
		});
	}

	/**
	 * Dispatches character updates to the story
	 */
	private static dispatchCharacterUpdates(
		stories: Story[], 
		story: Story, 
		newStorySetting: any, 
		dispatchStory: (updateStoryAction: UpdateStoryAction) => void,
		delayS?: number
	) {
		const updateAction = updateStory(stories, story, {
			storySetting: newStorySetting,
		});

		if (Number.isNaN(delayS) || !delayS || delayS < 0.050) {
			// Immediate update
			console.log('editChar: force reload characterSetting..');
			EvtMgr.emit(EventName.characterChange);
			dispatchStory(updateAction);
		} else {
			// Delayed update
			DelayTaskUtil.reInvokeDelayTask('CharacterMgr-editChar', () => {
				console.log('editChar: force reload characterSetting..', newStorySetting);
				EvtMgr.emit(EventName.characterChange);
				dispatchStory(updateAction);
			}, Number(delayS));
		}
	}

	static findCharWithName(displayName: string): Character | undefined {
		return this.getAlls().find(anyC => anyC.displayName === displayName);
	}
	static findCharIndexWithName(
		displayName: string,
        option?: {
			useLowerCase?: boolean;
			useTrim?: boolean
		}): number {

		let useTrim = option?.useTrim;
		if (useTrim) {
			displayName = displayName.trim();
		}

		let useLowerCase = option?.useLowerCase;
		if (useLowerCase) {
			displayName = displayName.toLowerCase();
		}

		return this.getAlls().findIndex(anyC => {
			let anCDisplayName = anyC.displayName;
			if (useTrim) {
				anCDisplayName = anCDisplayName.trim();
			}
			if (useLowerCase) {
				anCDisplayName = anCDisplayName.toLowerCase();
			}

			return anCDisplayName === displayName
		});
	}

	static getNewCharName() {
		let charNameDesc = {
			start: 'Character',
			nextCounter: 1,
			cur: 'Character 001'
		}

		let existedName = new Set(this.getAlls().map(each => each.displayName.trim().toLowerCase()));

		let maxIter = 25;
		let curIter = 0;
		while (existedName.has(charNameDesc.cur.trim().toLowerCase())) {
			charNameDesc.nextCounter++;
			let nextDigitPart = '' + charNameDesc.nextCounter;
			while (nextDigitPart.length < 3) {
				nextDigitPart = '0' + nextDigitPart;
			}
			charNameDesc.cur = charNameDesc.start + ' ' + nextDigitPart;

			curIter++;
			if (maxIter > curIter) continue;
			charNameDesc.cur = StringUtil.randomString();
			break;
		}
		return charNameDesc.cur;
	}
}
