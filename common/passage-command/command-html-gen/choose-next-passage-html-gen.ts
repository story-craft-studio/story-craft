import {ContentGenParamBundle} from "../IContentGen";
import {AbstractCodeAndContentGenerator} from "../AbstractCodeAndContentGenerator";

export default class ChooseNextPassageHtmlGen extends AbstractCodeAndContentGenerator {

	genHTMLContent(paramBundle: ContentGenParamBundle): string {
		let allPassageNames = paramBundle.story.passages.map(each => each.name);
		return allPassageNames.map(each => '[[' + each + ']]').join(' ')
	}
}
