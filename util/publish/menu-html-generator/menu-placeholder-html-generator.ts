import _ from "lodash";
import { Story } from "../../../store/stories";
import StringUtil from "../../StringUtil";

export type GenMenuPlaceHolderOption = {
	useDebug?: boolean;// default true;
	story: Story;
}

export class MenuPlaceholderHtmlGenerator {
	static genMenuPlaceHolder({ useDebug, story }: GenMenuPlaceHolderOption) {
		useDebug = _.isNil(useDebug) ? true : useDebug;

		let startMenuSetting = story.storySetting?.startMenuSetting;
		console.log('genMenuPlaceHolder with startMenuSetting', startMenuSetting);

		let backgroundColorOrImage = startMenuSetting?.backgroundGrup?.backgroundColorOrImage?.value;
		let urlTestResult = StringUtil.urlTest(backgroundColorOrImage);
		if (urlTestResult.isUrl) {
			backgroundColorOrImage = 'url(' + backgroundColorOrImage + ')';
		}

		let titleFontSize = startMenuSetting?.fontSize?.titleFontSize?.value;
		if (_.isNil(titleFontSize) || Number.isNaN(titleFontSize)) {
			titleFontSize = 24;
		}

		let titleFontSizeUnit = startMenuSetting?.fontSize?.titleFontSize?.unit;
		if (!titleFontSizeUnit) {
			titleFontSizeUnit = 'px';
		}

		return `\n
		<!--==================in-game-menu-STARTED!=====================--->
		<div class="ingame-menu">
			<div class="content">			
				<div class="title">				
					<p>${story.name}</p>
				</div>
				<hr/>
				<div class="options">
					<div class="each-option start-game">
						<p>Start New Game</p>
					</div>
					<div class="each-option continue">
						<p>Continue</p>
					</div>
				</div>							
			</div>
		</div>
		<style>
			#ui-bar {
				display: none;
			}
			
			body > .ingame-menu {
				position: absolute;
				top: 0;
				z-index: 2000;
				width: 100vw;
				height: 100vh;
				background: ${backgroundColorOrImage};								
				background-repeat: no-repeat;
				background-position: center;
				background-size: contain; 				
			}
			
			body > .ingame-menu.show-from-top {
				animation: ingame-menu-show-from-top 1s forwards;
			}
			body > .ingame-menu.hide-to-top {
				animation: ingame-menu-hide-to-top 1s forwards;
			}
			@keyframes ingame-menu-hide-to-top {
			  from {
			  	top: 0;
			  	opacity: 1;
			  }
			  to {
			  	top: -150vh;
			  	opacity: 0;
			  }
			}

			@keyframes ingame-menu-show-from-top {
			  from {
			  	top: -150vh;
			  	opacity: 0;
			  }
			  to {
			  	top: 0;
			  	opacity: 1;
			  }
			}
			
			body > .ingame-menu .content {		  
				margin-left: 15%;
				width: 75%;
			}
			
			body > .ingame-menu .title {			
				font-size: ${titleFontSize + titleFontSizeUnit};
  			font-weight: 800;
  			color: white;
			}
			
			body > .ingame-menu .content .options .each-option {	
				cursor: pointer;	
				background: linear-gradient(to right, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0));
  			transition: all 0.5s;
  			min-height: 3rem;
				padding: 10px;
				border-radius: 5px;
			}
			
			body > .ingame-menu .content .options .each-option:hover {			
				background: linear-gradient(to right, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0));
				transform: scale(1.02);
			}
			
			body > .ingame-menu .content .options .each-option p {			
				font-size: 25px;
				margin-left: 5px;
  			font-weight: 400;
  			color: white;
  			transition: all 0.5s ;
  			/*margin-top: auto;*/
  			/*margin-bottom: auto;*/
			}
			
			body > .ingame-menu .content .options .each-option:hover p {  	
				/* gold text color */
				background-image: radial-gradient(ellipse farthest-corner at right bottom, #FEDB37 0%, #FDB931 8%, #9f7928 30%, #8A6E2F 40%, transparent 80%),
                radial-gradient(ellipse farthest-corner at left top, #FFFFFF 0%, #FFFFAC 8%, #D1B464 25%, #5d4a1f 62.5%, #5d4a1f 100%);
        
		    color: transparent;
		    -webkit-text-fill-color: transparent;
		    
		    background-clip: text;
		    -webkit-background-clip: text;
			}
		</style>		
		<!--==================in-game-menu END!==========================--->
		`
	}
}
