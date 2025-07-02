import {Passage, Story, updatePassage, updatePassageCommand, updateStory} from "../../store/stories";
import DelayTaskUtil from "../../util/DelayTaskUtil";
import StringUtil from "../../util/StringUtil";
import {StoriesActionOrThunk} from "../../store/undoable-stories";
import EvtMgr, {EventName} from "../../common/evt-mgr";
import {CommandType, PassageCommand} from "../../common/passage-command/PassageCommandTypeDef";
import {
	NextPassageDesc, TargetPassageBy
} from "../../../custom-story/src/passage/passage-command-runner/command-runner/run-by-command-type/choose-next-passage-command";
import _ from "lodash";

export class PassageEditMgr {

	private static story: Story;
	private static passages: Passage[];
	private static tagSets: Set<string>;
	private static tagArr: any[];
	private static stories: Story[];

	static loadStory(story: Story, stories: Story[]) {
		this.story = story;
		this.stories = stories;
		this.passages = story.passages;

		let tags: Set<string> = new Set();
		story.passages.forEach(each => {
			each.tags.forEach(eachTag => {
				if (!eachTag) return;
				tags.add(eachTag);
			})
		});

		this.tagSets = tags;
		this.tagArr = Array.from(tags);

		//console.log('all tags', this.tagSets);
	}

	static withDispatcher(dispatcher: (actionOrThunk: StoriesActionOrThunk, annotation?: string) => void) {
		return new DispatchExecuter({
			dispatcher,
			stories: this.stories,
			story: this.story,
			passages: this.passages,
			tagSets: this.tagSets,
			tagArr: this.tagArr,
		});
	}
}

class DispatchExecuter {
	private readonly uid = 'DispatchExecuter-' + Date.now() + '-' + StringUtil.randomString();

	private readonly dispatcher: (actionOrThunk: StoriesActionOrThunk, annotation?: string) => void;
	private readonly story: Story;
	private readonly stories: Story[];
	private passages: Passage[];
	private tagSets: Set<string>;
	private tagArr: any[];

	constructor(args: {
		dispatcher: (actionOrThunk: StoriesActionOrThunk, annotation?: string) => void,
		stories: Story[],
		story: Story,
		passages: Passage[],
		tagSets: Set<string>,
		tagArr: string[],
	}) {
		this.dispatcher = args.dispatcher;
		this.story = args.story;
		this.stories = args.stories;
		this.passages = args.passages;
		this.tagSets = args.tagSets;
		this.tagArr = args.tagArr;
	}

	/**
	 *
	 * @param passage
	 * @param newTag {string} can be empty to indicate tag removal
	 * @param index {number}
	 */
	changeTags(passage: Passage, newTag: string, index: number) {
		if (!passage.tags) passage.tags = [];

		let curTag = passage.tags[index] || '';
		let curColor = this.story.tagColors?.[curTag];

		EvtMgr.emit(EventName.tagChangeStart, {
			from: curTag,
			to: newTag,
		});

		let newTagLists: string[] = [...passage.tags];
		newTagLists[index] = newTag;
		DelayTaskUtil.reInvokeDelayTask(this.uid + '-changeTags', () => {
			this.dispatcher(
				updatePassage(this.story, passage, {tags: newTagLists}, {dontUpdateOthers: true})
			);

			if (curColor) {
				const newTagColors = {...this.story.tagColors};
				newTagColors[newTag] = curColor;

				this.dispatcher(
					updateStory(this.stories, this.story, {tagColors: newTagColors})
				);
			}

			EvtMgr.emit(EventName.tagChangeEnd, {
				from: newTagLists[index],
				to: newTag,
			})
		}, 0.8);

		// when strictly disallow user from using obsolete tag, uncomment this
		//this.cleanUpOldObsoleteTags(passage);
	}

	removeTags(passage: Passage, index: number) {
		EvtMgr.emit(EventName.tagRemoveStart, {
			target: passage.tags[index] || '',
		});

		passage.tags.splice(index, 1);
		let newTagLists: string[] = [...passage.tags];

		this.dispatcher(
			updatePassage(this.story, passage, {tags: newTagLists}, {dontUpdateOthers: true})
		);

		EvtMgr.emit(EventName.tagRemoveEnd, {
			target: passage.tags[index] || '',
		})

		// when strictly disallow user from using obsolete tag, uncomment this
		// this.cleanUpOldObsoleteTags(passage);
	}

	private cleanUpOldObsoleteTags(passage: Passage) {
		let tagSetsAfterward = new Set();
		let firstTagAfterward: string = '';
		this.story.passages.forEach(eachP => {
			eachP.tags.forEach(eachTag => {
				if (!eachTag) return;

				tagSetsAfterward.add(eachTag);
				if (!firstTagAfterward) firstTagAfterward = eachTag;
			})
		})

		//#region cleanUp old obsolete tags
		//==========================
		DelayTaskUtil.reInvokeDelayTask(this.uid + '-cleanUpOldObsoleteTags', () => {
			this.story.passages.forEach(eachP => {
				eachP.commands.forEach((eachCmd, i) => {
					let eachCmdType = eachCmd.type;

					let tagCleanupRegister = tagCleanupRegisterMap.get(eachCmdType)
					if (!tagCleanupRegister) return;

					let stillReferencingTags = tagCleanupRegister.getReferencingTags(eachCmd);

					let obsoleteTags: string[] = [];
					stillReferencingTags.forEach(eachReferencingTag => {
						if (!tagSetsAfterward.has(eachReferencingTag))
							obsoleteTags.push(eachReferencingTag);
					})

					if (!obsoleteTags?.length) return;

					let newCommand = tagCleanupRegister.updateOldTag(eachCmd, obsoleteTags, firstTagAfterward);
					console.log('cleaned up old obsolete tags of ', eachP.name, 'command at', i, 'obsoleteTags = ', obsoleteTags);

					this.dispatcher(
						updatePassageCommand(
							this.story, passage, i, newCommand
						)
					);
				})
			});
		}, 1);
		//#endregion
	}
}

type TagCleanUpRegister = {
	getReferencingTags: (cmd: PassageCommand) => string[],
	updateOldTag: (cmd: PassageCommand, tags: string[], toTag: string) => PassageCommand,
}

const tagCleanupRegisterMap: Map<CommandType, TagCleanUpRegister> = new Map();
// tagCleanupRegisterMap.set(CommandType.jumpToPassageWithTag, {
// 	getReferencingTags: (cmd) => {
// 		let nextPassages: NextPassageDesc[] = cmd.content?.chooseNextPassageParam?.nextPassages;
// 		if (!nextPassages?.length) return [];
//
// 		let tags: string[] = [];
// 		nextPassages.forEach(each => {
// 			if (!each.text) return;
// 			if (each.targetBy && each.targetBy != TargetPassageBy.name) {
// 				return;
// 			}
//
// 			tags.push(each.text);
// 		})
// 		return tags;
// 	},
// 	updateOldTag: (cmd, tags, toTag) => {
// 		let nextPassages: NextPassageDesc[] = cmd.content?.chooseNextPassageParam?.nextPassages;
// 		if (!nextPassages?.length) return cmd;
//
// 		nextPassages.forEach(each => {
// 			if (!each.text) return;
//
// 			if (each.targetBy && each.targetBy != TargetPassageBy.name) {
// 				return;
// 			}
//
// 			if (!_.includes(tags, each.text)) return;
// 			each.text = toTag;
// 		})
// 		return cmd;
// 	}
// });
