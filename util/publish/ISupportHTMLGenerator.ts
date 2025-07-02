import {PublishSupportHTMLGeneratorParamBundle} from "./SupportHTMLGeneratorMgr";

export interface ISupportHTMLGenerator {
  	gen(paramBundle: PublishSupportHTMLGeneratorParamBundle): string;
	genStyle(paramBundle: PublishSupportHTMLGeneratorParamBundle): string;
}
