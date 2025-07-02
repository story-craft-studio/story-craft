import _ from "lodash";

export default class StyleSheetToDisplayPassageCommandGenerator {
	gen(option?: { topElementSelector?: string, useDebug?: boolean }) {
		let topElementSelector = option?.topElementSelector;
		if (!topElementSelector) topElementSelector = 'body';

		let useDebug = _.isNil(option?.useDebug) ? true : option?.useDebug;

		return `<style>        
    ${topElementSelector} > #ui-bar {
    	${useDebug ? "" : "display: none; width: 0; height: 0;"}        
    }
        
    ${topElementSelector} .hide-takeup-space {
        opacity: 0;
    }
    
    ${topElementSelector} .hide {
        display: none;
        width: 0;
        height: 0;
    }
    
		${topElementSelector} > div[id="story"][role="main"] {
			background-color: #fff;
			background-image: url('https://www.codewithrandom.com/wp-content/uploads/2022/10/Number-Guessing-Game-using-JavaScript-3.png');
			background-repeat: no-repeat;  
			background-size: 100% 100%;
		}
		
		${topElementSelector} > div[id="story"][role="main"] > div[id="passages"] > div[class="passage"][data-passage] > span[data-name][data-type][title] {
			opacity: 0 !important;
			width: 0 !important;
			height: 0 !important;  
			display: block !important;
		}

		${topElementSelector} .normal-link {
			width: 100%;
			min-height: 300px;
		}	
		
		${topElementSelector} .my-passage-command-descriptor {
			display: none;
		}	
		
		${topElementSelector} .passage-container {
			font-size: 1.5em;
			width: 100%;				  
			min-width: 250px;
            min-height: 120px;
		}
		
		${topElementSelector} .passage-container br {
			display: none;	
		}
		
		${topElementSelector} div[hidden] {
			display: none;
			height: 0;
		}
		
		${topElementSelector} div[customhidden] {
			display: none;
			height: 0;
		}
	</style>`
	}
}
