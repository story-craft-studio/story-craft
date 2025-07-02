import { CodeGenParamBundle } from "../ICodeGen";
import _ from "lodash";
import { ContentGenParamBundle, StyleSheetGenParamBundle } from "../IContentGen";
import { AbstractCodeAndContentGenerator } from "../AbstractCodeAndContentGenerator";
import { CSSProperties } from "react";
import StringUtil from "../../../util/StringUtil";

export default class CharacterDialogHtmlGen extends AbstractCodeAndContentGenerator {

	genHTMLContent(paramBundle: ContentGenParamBundle): string {
		return `<div></div>`;

		// @deprecated
		let charName = paramBundle.cmd.content?.characterName;
		let titlePos = paramBundle.cmd.content?.position || 'left';
		let needHideTitle = _.isNil(charName);

		let characterDialogSetting = paramBundle.story.storySetting.characterDialogSetting || {};


		// Split text into words
		const rawText = paramBundle.commandContentText || paramBundle.cmd.content?.text || '';

		let characterDialogContainerStyleText = this.getCDialogContainerStyle(characterDialogSetting);
		let characterDialogTitleStyleText = this.getCDialogTitleStyle(characterDialogSetting, !!charName);
		let characterDialogStyleText = this.getCDialogStyle(characterDialogSetting);

		//TODO: support show multiple characters ?
		let html = `   
            <div class="character-dialog-container" style="${characterDialogContainerStyleText}">
                <div class="relative-title ${titlePos} ${needHideTitle ? 'hide' : ''}">
                    <div class="title-content" style="${characterDialogTitleStyleText}">
                        ${charName}
                    </div>
                </div>
                <div id="animated-text" class="character-dialog-content" style="${characterDialogStyleText}">            
                    ${rawText}
                </div>
            </div>
        `
		return html;
	}

	genStyleSheet(paramBundle: StyleSheetGenParamBundle) {
		// in case desktop and mobile ratio
		const vHeight = (window.innerWidth > window.innerHeight) ? 'vh' : 'vw';
		const vWidth = (window.innerWidth > window.innerHeight) ? 'vw' : 'vh';
		
		return `
        <style>        
            .character-dialog-container {
                width: 100%;
                height: auto;
                min-height: 15${vHeight};
                max-height: 20${vHeight};
                padding: 10px 0;

                display: block;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                margin-inline: auto;

				z-index: 1001;
            }
            
            .character-dialog-container .relative-title {
                text-align: left;
                position: absolute;
                width: 15${vWidth};
				min-width: 200px;
				top: -10%;
            }

			
			.character-dialog-container .left {
				left: 10%;
			}

			.character-dialog-container .right {
				left: calc(90% - 15vw);
			}
            
            .character-dialog-container .title-content {
                width: 100%;
                display: inline-block;
                border-radius: 15px;
                background: #efcfb0;
                text-align: center;
                padding: 15px 10px;
                box-sizing: border-box;
                text-align: center;
            }
            
            .character-dialog-container .character-dialog-content {
                display: block;
                height: 100%;
                min-height: 15${vHeight};
                color: white;
                overflow: auto;
                word-break: break-word;
                text-align: left;
                padding: 0 20px;
                margin: 0 auto;
                position: relative;
                white-space: normal;
            }

            @keyframes fadeInWord {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            .word {
                opacity: 0;
                animation: fadeInWord 0.3s forwards;
                display: inline;
            }
        </style>
        `
	}

	private getCDialogTitleStyle(characterDialogSetting, isVisible) {
		let background = characterDialogSetting['background']?.['titleBackgroundImage']?.value + "" || "";
		let backgroundColor = characterDialogSetting['background']?.['titleBackgroundColor']?.value + "" || "";

		let backgroundImageExtraSettings = {}
		let finalBackground = backgroundColor;

		let urlTestResult = StringUtil.urlTest(background)
		if (urlTestResult.isUrl) {
			finalBackground = 'url(' + background + ')';
			backgroundImageExtraSettings = {
				backgroundRepeat: 'no-repeat',
				backgroundSize: '80% auto',
				backgroundPosition: 'center center',
			}
		}

		let fontVal = characterDialogSetting['fontSize']?.['titleFontSize']?.value;
		let fontUnit = characterDialogSetting['fontSize']?.['titleFontSize']?.unit || 'px';
		let fontStr = _.isNil(fontVal)
			? '1.5rem'
			: fontVal + fontUnit

		let textColor = characterDialogSetting['textColor']?.['titleTextColor']?.value || 'inherit';

		let characterDialogTitleStyle: CSSProperties = {
			background: finalBackground,
			fontSize: fontStr,
			color: textColor,
			visibility: isVisible ? 'visible' : 'hidden',
			...backgroundImageExtraSettings,
		}
		return StringUtil.fromCSSPropertiesObj(characterDialogTitleStyle);
	}

	private getCDialogContainerStyle(characterDialogSetting) {
		let background = characterDialogSetting['background']?.['dialogBackgroundImage']?.value + "" || "";
		let backgroundColor = characterDialogSetting['background']?.['dialogBackgroundColor']?.value + "" || "";

		let backgroundImageExtraSettings = {};
		let finalBackground = backgroundColor;

		let urlTestResult = StringUtil.urlTest(background);
		if (urlTestResult.isUrl) {
			finalBackground = 'url(' + background + ')';
			backgroundImageExtraSettings = {
				backgroundRepeat: 'no-repeat',
				backgroundSize: '80% auto',
				backgroundPosition: 'center center',
			}
		}

		let characterDialogContainerStyle: CSSProperties = {
			background: finalBackground,
			...backgroundImageExtraSettings,
		}
		return StringUtil.fromCSSPropertiesObj(characterDialogContainerStyle);
	}

	private getCDialogStyle(characterDialogSetting) {
		let dialogSize = characterDialogSetting['fontSize']?.['dialogSize']?.value + "px" || "200px";
		let fontVal = characterDialogSetting['fontSize']?.['dialogFontSize']?.value;
		let fontUnit = characterDialogSetting['fontSize']?.['dialogFontSize']?.unit || 'px';
		let fontStr = _.isNil(fontVal)
			? '1.5rem'
			: fontVal + fontUnit

		let textColor = characterDialogSetting['textColor']?.['dialogTextColor']?.value || 'inherit';
		let characterDialogStyle: CSSProperties = {
			width: 'min(@size, 80%)'.replace('@size', dialogSize),
			fontSize: fontStr,
			color: textColor,
		}
		return StringUtil.fromCSSPropertiesObj(characterDialogStyle);
	}
}
