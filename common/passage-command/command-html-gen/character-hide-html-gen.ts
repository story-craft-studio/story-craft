import {ContentGenParamBundle} from "../IContentGen";
import {AbstractCodeAndContentGenerator} from "../AbstractCodeAndContentGenerator";

export default class CharacterHideHtmlGen extends AbstractCodeAndContentGenerator {

	genHTMLContent(paramBundle: ContentGenParamBundle): string {
		return '&nbsp;';
	}

}
