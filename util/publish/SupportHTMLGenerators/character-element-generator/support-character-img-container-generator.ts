import {ISupportHTMLGenerator} from "../../ISupportHTMLGenerator";
import { PublishSupportHTMLGeneratorParamBundle } from "../../SupportHTMLGeneratorMgr";
import {CSSProperties} from "react";
import StringUtil from "../../../StringUtil";

export default class SupportCharacterImgContainerGenerator implements ISupportHTMLGenerator{
	gen(paramBundle: PublishSupportHTMLGeneratorParamBundle): string {
		const basicCharacterDialogImgContainerStyle: CSSProperties = {
			//what ?
		};
		let characterDialogImgContainerPositionStyleAsString = StringUtil.fromCSSPropertiesObj(basicCharacterDialogImgContainerStyle);

		return `     
            <div id="character-dialog-img-container" class="character-dialog-img-container" style="${characterDialogImgContainerPositionStyleAsString}">
                <!--more character images will be added here-->
            </div>            
			`;
	}

	genStyle(paramBundle: PublishSupportHTMLGeneratorParamBundle): string {
		return `<style>
				.character-dialog-img-container {
				}
					
				.character-dialog-img-container .character-dialog-img {  
					position: absolute;					
					left: 20%;
					bottom: 100px;
					opacity: 0; /* CharacterContainer is hidden by default */
				}
				
				.character-dialog-img-container img {
					width: 100%;
				}
				   
			</style>`;
	}
}
