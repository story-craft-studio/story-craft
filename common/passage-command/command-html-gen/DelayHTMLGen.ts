import {ContentGenParamBundle} from "../IContentGen";
import {AbstractCodeAndContentGenerator} from "../AbstractCodeAndContentGenerator";

export default class DelayHTMLGen extends AbstractCodeAndContentGenerator {

  genHTMLContent(paramBundle: ContentGenParamBundle): string {
    return '&nbsp;';
  }
}
