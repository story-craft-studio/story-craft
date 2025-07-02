import { ISupportHTMLGenerator } from "../ISupportHTMLGenerator";
import { PublishSupportHTMLGeneratorParamBundle } from "../SupportHTMLGeneratorMgr";

export default class SupportChooseNextPassageModalGenerator implements ISupportHTMLGenerator {
	gen(paramBundle: PublishSupportHTMLGeneratorParamBundle): string {
		return `
		    <div id="my-choose-next-passage-modal" class="modal">		
		        <div class="modal-content" style="">
		            <div class="modal-header">
		                <h2 class="modal-header-text" style="width: 100%; margin: 10px 0;">
							So what's your choice ?
						</h2>
		            </div>
		            <div class="modal-body" style="
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        text-align: center;
                        padding: 20px;
						width: 100%;
					">
		            </div>
		        </div>		
		    </div>`
	}

	genStyle(paramBundle: PublishSupportHTMLGeneratorParamBundle): string {
		return `
		<style>
			.modal-content {
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				border-radius: 8px;
				overflow: hidden;
				background-color: rgba(255, 255, 255, 0.49);
				width: 60%;
				max-width: 800px;
			}
			.modal-header {
				color: white;
				text-align: center;
				padding: 20px;
				background: linear-gradient(to right, rgba(0, 0, 0, 0) 0%, black 50%, rgba(0, 0, 0, 0) 100%);
				width: 80%;
			}
			.modal-body .each-next-passage-container {
			    display: flex;
	            padding: 5px;
	            background: linear-gradient(to right, rgba(255, 255, 255, 0) 0%, white 50%, rgba(255, 255, 255, 0) 100%);
				font-size: 20px;
				text-align: center;
				width: 80%;
				margin-bottom: 5px;
			}
			.modal-body .each-next-passage-container span {
			    margin: auto 5px;
				width: 100%;
			}
			
			.modal-body .each-next-passage-container.click-me-to-go {
				cursor: pointer;
			}
			.modal-body .each-next-passage-container.click-me-to-go:hover {
				background: rgba(60, 105, 255, 0.2);
	
				p.p-tag {
					color: rgb(182, 218, 229);
				}
				
			}
			
			.modal-body .each-next-passage-container.click-me-to-go p.p-name{
			    color: #594fb4;
			    font-size: 1.2rem;
			    font-weight: 500;
				width: 100%;
			}
			.modal-body .each-next-passage-container.click-me-to-go p.p-tag{
			    color:rgb(74, 89, 94);
			    font-size: 1.2rem;
			    font-weight: 500;
				width: 100%;
			}
		</style>
		`;
	}
}
