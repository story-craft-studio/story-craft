import {ISupportHTMLGenerator} from "./ISupportHTMLGenerator";
import SupportModalGenerator from "./SupportHTMLGenerators/SupportModalGenerator";
import SupportChooseNextPassageModalGenerator from "./SupportHTMLGenerators/SupportChooseNextPassageModalGenerator";
import SupportCharacterImgContainerGenerator from "./SupportHTMLGenerators/character-element-generator/support-character-img-container-generator";
import {Story} from "../../store/stories";
import SupportBgGenerator from "./SupportHTMLGenerators/bg/support-bg-generator";

export default class SupportHTMLGeneratorMgr {
	_generators: ISupportHTMLGenerator[];

	constructor() {
		this._generators = [
			new SupportModalGenerator(),
			new SupportBgGenerator(),
			new SupportCharacterImgContainerGenerator(),
			new SupportChooseNextPassageModalGenerator(),
		];
	}

	genHTML(paramBundle: PublishSupportHTMLGeneratorParamBundle) {
		let htmlGenerated = ``;
		this._generators.forEach(each => {
			htmlGenerated += each.gen(paramBundle)
		})
		return htmlGenerated;
	}

	genStyles(paramBundle: PublishSupportHTMLGeneratorParamBundle) {
		let styleTextGenerated = ``;
		this._generators.forEach(each => {
			styleTextGenerated += each.genStyle(paramBundle)
		})
		return styleTextGenerated;
	}
}

export type PublishSupportHTMLGeneratorParamBundle = {
	story: Story,
}
