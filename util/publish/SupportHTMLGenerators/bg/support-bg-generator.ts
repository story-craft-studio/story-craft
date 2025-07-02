import {ISupportHTMLGenerator} from "../../ISupportHTMLGenerator";
import {PublishSupportHTMLGeneratorParamBundle} from "../../SupportHTMLGeneratorMgr";

export default class SupportBgGenerator implements ISupportHTMLGenerator {
	gen(paramBundle: PublishSupportHTMLGeneratorParamBundle): string {
		return `
			<div class="SupportBgGenerator background">
				<img alt="" src=""/>
			</div>
		`;
	}

	genStyle(paramBundle: PublishSupportHTMLGeneratorParamBundle): string {
		return `
		<style>		
			.SupportBgGenerator {
			  	width: 100%;  
			  	height: 100vh;
			}
			.SupportBgGenerator img {			
			  	position: fixed;
				top: 0;
				left: 50%;
				transform: translateX(-50%);
				width: auto;
				height: 90vh;
				background-size: auto 90vh;
			}
		</style>
		`;
	}
}
