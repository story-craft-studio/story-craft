import {ContentGenParamBundle, IContentGen, StyleSheetGenParamBundle} from "./IContentGen";

export abstract class AbstractCodeAndContentGenerator implements IContentGen {

  genHTMLContent(paramBundle: ContentGenParamBundle): string {
    return paramBundle.commandContentText || paramBundle.cmd.content?.text || '';
  }

  genStyleSheet(paramBundle: StyleSheetGenParamBundle) {
    return '';
  }
}
