import {Passage, Story} from "../../store/stories";
import CustomCommandCodeGen from "./command-html-gen/CustomCommandCodeGen";
import ChangeBackgroundHtmlGen from "./command-html-gen/change-background-html-gen";
import DelayHTMLGen from "./command-html-gen/DelayHTMLGen";
import {CommandTypeConfig} from "./command-html-gen/CommandTypeConfig";
import {CommandType, PassageCommand} from "./PassageCommandTypeDef";
import ChooseNextPassageHtmlGen from "./command-html-gen/choose-next-passage-html-gen";
import CharacterDialogHtmlGen from "./command-html-gen/character-dialog-html-gen";
import {AbstractCodeAndContentGenerator} from "./AbstractCodeAndContentGenerator";
import EmptyPlaceHolderCodeGen from "./command-html-gen/EmptyPlaceHolderCodeGen";
import JumpToPassageHTMLGen from "./command-html-gen/jump-to-passage-html-gen";
import CharacterShowHtmlGen from "./command-html-gen/character-show-html-gen";
import CharacterHideHtmlGen from "./command-html-gen/character-hide-html-gen";
import ClearScreenHtmlGen from "./command-html-gen/clear-screen-html-gen";


export default class PassageCommandMgr {
	static codeGenBaseOnPassageAndCommandTypeMap: Map<string, AbstractCodeAndContentGenerator> = new Map();

	static {

		//determine how to gen js code base on command type
		this.codeGenBaseOnPassageAndCommandTypeMap.set(
			this._genMapId(undefined, {type: CommandType.newCommand}, undefined),
			new EmptyPlaceHolderCodeGen()
		);

		this.codeGenBaseOnPassageAndCommandTypeMap.set(
			this._genMapId(undefined, {type: CommandType.customCommand}, undefined),
			new CustomCommandCodeGen()
		);

		this.codeGenBaseOnPassageAndCommandTypeMap.set(
			this._genMapId(undefined, {type: CommandType.changeBackground}, undefined),
			new ChangeBackgroundHtmlGen()
		)

		this.codeGenBaseOnPassageAndCommandTypeMap.set(
			this._genMapId(undefined, {type: CommandType.delay}, undefined),
			new DelayHTMLGen()
		)

		this.codeGenBaseOnPassageAndCommandTypeMap.set(
			this._genMapId(undefined, {type: CommandType.chooseNextPassage}, undefined),
			new ChooseNextPassageHtmlGen()
		)

		this.codeGenBaseOnPassageAndCommandTypeMap.set(
			this._genMapId(undefined, {type: CommandType.jumpToPassageWithTag}, undefined),
			new JumpToPassageHTMLGen()
		)

		this.codeGenBaseOnPassageAndCommandTypeMap.set(
			this._genMapId(undefined, {type: CommandType.characterDialog}, undefined),
			new CharacterDialogHtmlGen()
		);

		this.codeGenBaseOnPassageAndCommandTypeMap.set(
			this._genMapId(undefined, {type: CommandType.characterShow}, undefined),
			new CharacterShowHtmlGen()
		);

		// this.codeGenBaseOnPassageAndCommandTypeMap.set(
		// 	this._genMapId(undefined, {type: CommandType.characterHide}, undefined),
		// 	new CharacterHideHtmlGen()
		// );

		this.codeGenBaseOnPassageAndCommandTypeMap.set(
			this._genMapId(undefined, {type: CommandType.clearScreen}, undefined),
			new ClearScreenHtmlGen()
		);
	}


	static genHTMLContentFor(story: Story, p: Passage, cmd: PassageCommand, commandContentText?: string) {
		let mapSignature = this._genMapId(p, cmd, commandContentText || cmd?.content?.text);
		let codeGenerator = this.codeGenBaseOnPassageAndCommandTypeMap.get(mapSignature);
		if (!codeGenerator) {
			console.warn('in genHTMLContentFor: No generator registered with signature ', mapSignature, 'from', p, cmd, commandContentText);
			return commandContentText || cmd?.content?.text || '';
		}

		let htmlContent = codeGenerator.genHTMLContent(
			{story, p, cmd, commandContentText}
		);
		return htmlContent;
	}

	static genStyleSheets(story: Story, p: Passage) {
		let generators = this.codeGenBaseOnPassageAndCommandTypeMap.values();

		let styleSheets = ``;
		for (const eachGenerator of generators) {

			let eachStyleSheet = eachGenerator.genStyleSheet({
				story,
				passage: p
			})

			if (!eachStyleSheet) continue;
			styleSheets += eachStyleSheet;
		}
		return styleSheets;

	}

	static getCommandEditorStyleConfig(type: CommandType) {
		return CommandTypeConfig[type]?.editor?.contentInputStyle || {height: '200px'};
	}

	static getCommandEditorClassNameConfig(type: CommandType) {
		return CommandTypeConfig[type]?.editor?.className || type;
	}

	private static _genMapId(p?: Passage, cmd?: Partial<PassageCommand>, commandContentText?: string) {
		return 'codeGenSignature-' + cmd?.type;
	}
}
