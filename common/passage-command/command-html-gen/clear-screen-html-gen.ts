import {ContentGenParamBundle} from "../IContentGen";
import {AbstractCodeAndContentGenerator} from "../AbstractCodeAndContentGenerator";

export default class ClearScreenHtmlGen extends AbstractCodeAndContentGenerator {
    genHTMLContent(paramBundle: ContentGenParamBundle): string {
        return '&nbsp;';
    }
} 