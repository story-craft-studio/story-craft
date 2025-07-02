import {Passage} from "../../store/stories";

import {PassageCommand} from "./PassageCommandTypeDef";

export interface ICodeGen {
  genCode(paramBundle: CodeGenParamBundle): string;
}

export type CodeGenParamBundle = {
  p: Passage,
  cmd: PassageCommand,
  commandContentText?: string
}
