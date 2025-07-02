import {Passage, Story} from "../../store/stories";
import {PassageCommand} from "./PassageCommandTypeDef";

export interface IContentGen {
  genHTMLContent(paramBundle: ContentGenParamBundle): string;
  genStyleSheet(paramBundle: StyleSheetGenParamBundle): string;
}

export type StyleSheetGenParamBundle = {
  story: Story,
  passage: Passage
}

export type ContentGenParamBundle = {
  story: Story;
  p: Passage,
  cmd: PassageCommand,
  commandContentText?: string
}
