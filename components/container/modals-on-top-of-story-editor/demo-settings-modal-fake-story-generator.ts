import {Passage, Story} from "../../../store/stories";
import {CommandType, PassageCommand} from "../../../common/passage-command/PassageCommandTypeDef";
import {Character} from "../../../routes/story-edit/toolbar/settings/character-settings/character-typedef";
import _ from "lodash";
import StringUtil from "../../../util/StringUtil";

const fakeCharName = 'A name'
const fakeImgSrc = 'https://img-sketch.pixiv.net/uploads/medium/file/12440321/w1080_8251330112211295064.png';
export default class DemoSettingsModalFakeStoryGenerator {
	static genFakeCharacter(): Character {
		return {
			id: _.random(0, 100),
			displayName: fakeCharName,
			imgUrl: fakeImgSrc,
			skins: [{
				imgUrl: fakeImgSrc,
				id: StringUtil.randomString(),
			}]
		}
	}

    static addExtraFakeDetailToStory(realStory: Story) {
		console.log('addExtraFakeDetailToStory', realStory);

		let fakeStory = structuredClone(realStory);
		if (!fakeStory.storySetting.characterSetting) {
			fakeStory.storySetting.characterSetting = {};
		}

		let characters = fakeStory.storySetting.characterSetting.characters;
		if (!characters?.length) {
			characters = [this.genFakeCharacter()];
		}

		fakeStory.storySetting.characterSetting.characters = characters;
		fakeStory.orientation = realStory.orientation;
		return fakeStory;
	}

    static genFakePassage(fakeStory: Story): {
		fakePassage: Passage;
		fakeDialogCmd: PassageCommand;
		fakeShowCharacterCmd: PassageCommand;
	} {
		let characters = fakeStory.storySetting.characterSetting.characters;
		let fakeCharacter: Character | undefined = characters?.[0];
		if (!fakeCharacter) {
			fakeCharacter = this.genFakeCharacter();
		}

		let fakeDialogCmd = this.findFirstCmdOrGenFake(fakeStory, CommandType.characterDialog, {
			type: CommandType.characterDialog,
			content: {
				text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse ut magna fermentum, porttitor nisl in, ultrices eros. Cras at quam a nisl tristique consequat quis ac turpis...',
				characterName: fakeCharacter.displayName,
			},
			id: '0',
		});

		let fakeShowCharCmd = this.findFirstCmdOrGenFake(fakeStory, CommandType.characterShow, {
			type: CommandType.characterDialog,
			content: {
				text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse ut magna fermentum, porttitor nisl in, ultrices eros. Cras at quam a nisl tristique consequat quis ac turpis...',
				characterName: fakeCharacter.displayName,
			},
			id: '0',
		});

        // let fakeStartMenuCmd = this.findFirstCmdOrGenFake(fakeStory, CommandType.startMenu, {
        //     type: CommandType.startMenu,
        //     content: {
        //         title: "Game Title",
        //         menuItems: [
        //             { label: "New Game", action: "start-game" },
        //             { label: "Load Game", action: "continue" },
        //         ]
        //     },
        //     id: '0',
        // });

		let fakePassage = {
			highlighted: false,
			id: '0',
			story: '-1',
			top: Math.random() * 10000,
			left: Math.random() * 10000,
			width: 100,
			height: 100,
			tags: [],
			name: 'a name',
			selected: false,
			commands: [fakeDialogCmd, fakeShowCharCmd],
		}

		return {
			fakePassage,
			fakeDialogCmd,
			fakeShowCharacterCmd: fakeShowCharCmd
		}
	}

	static findFirstCmdOrGenFake (fakeStory: Story, targetType: CommandType, fakeCmdToUse: PassageCommand) {
		let startPassageId = fakeStory.startPassage;
		let startPassage = fakeStory.passages.find(anyP => anyP.id === startPassageId);
		let firstCmd: PassageCommand | undefined;

		if (startPassage) {
			//find first command of target type
			firstCmd = startPassage?.commands?.find(anyC => anyC.type === targetType);
		}

		if (!firstCmd) {
			//loop till found a passage has command of targetType
			fakeStory.passages.some(anyP => {
				return anyP.commands?.some(anyC => {
					let hasDialog = anyC.type === targetType;
					if (hasDialog) firstCmd = anyC;
					return hasDialog
				})
			});
		}

		if (!firstCmd) {
			firstCmd = fakeCmdToUse;
		}

		return firstCmd;
	}
}
