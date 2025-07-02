import {Story} from "../store/stories";
import StringUtil from "./StringUtil";

export default class StoryEncoder {
	private _replaceStringLiteralWithSpecialCharacter: string;
	get replaceStringLiteralWithSpecialCharacter(): string {
		return this._replaceStringLiteralWithSpecialCharacter;
	}
	set replaceStringLiteralWithSpecialCharacter(newR: string) {
		this._replaceStringLiteralWithSpecialCharacter = newR;
	}

	private constructor() {
		let randomStr = StringUtil.randomString(16);
		this._replaceStringLiteralWithSpecialCharacter ='##SCSC-' + randomStr + '-SCSC##';
	}

	encode(anyObj: Object) {
		let storyJSON = JSON.stringify(anyObj);
		storyJSON = storyJSON.replaceAll("'", this._replaceStringLiteralWithSpecialCharacter);
		storyJSON = encodeURI(storyJSON);
		return storyJSON;
	}

	decode(anyJSON: string): Object | undefined {
		anyJSON = decodeURI(anyJSON);

		anyJSON = anyJSON.replace(/\t/g, '');

		//replace each new line with  <br/>
		anyJSON = anyJSON.replace(/(?:\\r\\n|\\r|\\n)/g, '<br/>');

		anyJSON = anyJSON.replaceAll(this._replaceStringLiteralWithSpecialCharacter, "'");

		let anyObj: Object;
		try {
			anyObj = JSON.parse(anyJSON);
		} catch (e) {
			console.error('Error with json parse: ', e, ' json string = ', anyJSON);
			return undefined;
		}
		return anyObj;
	}

	static create(): StoryEncoder {
		let s = new StoryEncoder();
		return s;
	}
}
