import {CodeGenParamBundle, ICodeGen} from "../ICodeGen";
import _ from "lodash";
import {ContentGenParamBundle, IContentGen} from "../IContentGen";
import {AbstractCodeAndContentGenerator} from "../AbstractCodeAndContentGenerator";

export default class EmptyPlaceHolderCodeGen extends AbstractCodeAndContentGenerator {

  genHTMLContent(paramBundle: ContentGenParamBundle): string {
    return paramBundle.commandContentText || paramBundle.cmd.content?.text || '&nbsp;';
  }

  genCode(paramBundle: CodeGenParamBundle): string {
    return '';
  }
}
