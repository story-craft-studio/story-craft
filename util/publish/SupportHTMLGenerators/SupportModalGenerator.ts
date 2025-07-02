import {ISupportHTMLGenerator} from "../ISupportHTMLGenerator";
import { PublishSupportHTMLGeneratorParamBundle } from "../SupportHTMLGeneratorMgr";

export default class SupportModalGenerator implements ISupportHTMLGenerator{
	  gen(paramBundle: PublishSupportHTMLGeneratorParamBundle): string {
			return `
			<div id="my-support-modal" class="modal">		
				<div class="modal-content">				
					<div class="modal-header">
						<h2 class="modal-header-text">Hey</h2>
					</div>
					<div class="modal-body">
						<p class="modal-body-text">Hey</p>
					</div>
					<div class="modal-footer">
						<h3></h3>
					</div>
				</div>		
			</div>
			`;
	  }

	genStyle(paramBundle: PublishSupportHTMLGeneratorParamBundle): string {
		return `<style>
		.modal {
			display: none; /* Hidden by default */
			position: fixed; /* Stay in place */
			z-index: 101; /* Sit on top */
			left: 0;
			top: 0;
			width: 100%; /* Full width */
			height: 100%; /* Full height */
			overflow: auto; /* Enable scroll if needed */
			background-color: rgb(0,0,0); /* Fallback color */
			background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
		    color: black;
		}
		
		.modal-header {
			padding: 2px 16px;
			background-color: #5cb85c;
			color: white;
		}
		
		/* Modal Body */
		.modal-body {padding: 2px 16px;}
		
		/* Modal Footer */
		.modal-footer {
			padding: 2px 16px;
			background-color: #5cb85c;
			color: white;
		}
		
		/* Modal Content */
		.modal-content {
			position: relative;
			background-color: #fefefe;
			margin: 5% auto;
			padding: 0;
			border: 1px solid #888;
			width: 80%;
			box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19);
			animation-name: animatetop;
			animation-duration: 0.4s
		}
		
		/* Add Animation */
		@keyframes animatetop {
			from {top: -300px; opacity: 0}
			to {top: 0; opacity: 1}
		}
		
		/* The Close Button */
		.close {
			color: #aaa;
			float: right;
			font-size: 28px;
			font-weight: bold;
		}
		
		.close:hover,
		.close:focus {
			color: black;
			text-decoration: none;
			cursor: pointer;
		}
	</style>`;
	}
}
