import {ContentGenParamBundle} from "../IContentGen";
import {AbstractCodeAndContentGenerator} from "../AbstractCodeAndContentGenerator";

export default class CustomCommandCodeGen extends AbstractCodeAndContentGenerator {

  genHTMLContent(paramBundle: ContentGenParamBundle): string {
    return paramBundle.commandContentText || paramBundle.cmd.content?.text || '&nbsp;';
  }

}
