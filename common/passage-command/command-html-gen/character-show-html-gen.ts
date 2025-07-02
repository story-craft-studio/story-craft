import {ContentGenParamBundle, StyleSheetGenParamBundle} from "../IContentGen";
import {AbstractCodeAndContentGenerator} from "../AbstractCodeAndContentGenerator";

export default class CharacterShowHtmlGen extends AbstractCodeAndContentGenerator {

	genHTMLContent(paramBundle: ContentGenParamBundle): string {
		return '&nbsp;';
	}

}
