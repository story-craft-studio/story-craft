import {ContentGenParamBundle} from "../IContentGen";
import {AbstractCodeAndContentGenerator} from "../AbstractCodeAndContentGenerator";
import { deprecate } from "util";


/**
 * The base class for html gen background in-game
 *
 * @deprecated Use {@link CanvasBackground} instead
 **/
export default class ChangeBackgroundHtmlGen extends AbstractCodeAndContentGenerator {

  genHTMLContent(paramBundle: ContentGenParamBundle): string {
    return paramBundle.commandContentText || paramBundle.cmd.content?.text || '&nbsp;';
  }
}
