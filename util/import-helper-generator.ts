import {Story} from "../store/stories";
import _ from "lodash";
import StoryEncoder from "./story-ecoder";

export default class ImportHelperGenerator {
	private static readonly containerClassName = 'ImportHelperGenerator';
	private static dept = 0;
	private static encoder: StoryEncoder;

    static {
		ImportHelperGenerator.encoder = StoryEncoder.create();
		ImportHelperGenerator.encoder.replaceStringLiteralWithSpecialCharacter = '##SCSC-ImportHelperGenerator-SCSC##';
    }

	static genHTMLContent(option: { story: Story }) {
		console.log('ImportHelperGenerator genHTMLContent..');

		let storySetting = option.story.storySetting || {};

		// bad, unfinished
		// let storySettingHTML = ImportHelperGenerator.iterateObjAndReplaceWithDivs(storySetting);

		let storySettingJSON = this.encoder.encode(storySetting);
		return `
			<div class="${ImportHelperGenerator.containerClassName}">
				<div propertyName="storySetting" class="hide noSize">
					${storySettingJSON}
				</div>
			</div>
		`;
	}


	static readObjectFromElement(propertyName: string, ele: HTMLDivElement): Object | undefined {
		let container = ele.querySelector('.' + this.containerClassName);
		if (!container) {
			console.warn('Import failure cuz cannot find any div with class name', this.containerClassName, 'in imported html', ele);
			return undefined;
		}

		let content = container.querySelector('div > div[propertyName="' + propertyName + '"]');
		if (!content) {
			console.warn('No div found with propertyName ', propertyName, 'in container', container);
			return undefined;
		}

		let obj = this.encoder.decode(content.innerHTML);
		console.log('ImportHelperGenerator.readObjectFromElement', propertyName, 'got', obj);

		return obj;
	}


	static iterateObjAndReplaceWithDivs(obj: Object, propertyLink: string = '', str?: string): string {
		this.dept++;
		if (_.isNil(str)) str = `%%me%%`;

		let propertyNames = Object.keys(obj);

		let innerHTML = '';
		for (let i = 0; i < propertyNames.length; i++) {
			let propertyName = propertyNames[i];
			if (!propertyName) continue;
			if (!obj.hasOwnProperty(propertyName)) continue;

			let curPropertyLink = propertyLink + '.' + propertyName;

			let val = obj[propertyName];
			if (_.isNil(val)) val = 'null';

			let nextInnerHTML: string;
			let typeOfVal =
				Array.isArray(val) ? 'array' : typeof val;

			if (typeOfVal == "object") {
				nextInnerHTML = `
				<div propertyName="${propertyName}" type="${typeOfVal}">
					${cloneStr("  ", this.dept)} %%me%%
				</div>
			`;

				nextInnerHTML = this.iterateObjAndReplaceWithDivs(val, curPropertyLink, nextInnerHTML);
			} else {
				nextInnerHTML = `
				<div propertyName="${propertyName}" type="${typeOfVal}">
					${val + ''}
				</div>
			`;
			}
			innerHTML += nextInnerHTML;
			// console.log('innerHTML =', innerHTML);
		}
		str = str.replace('%%me%%', innerHTML);

		this.dept--;
		return str;
	}
	static iterateDivsAndBuildObj(content: Element): Object {
		dept++;
		let childDivs = content.querySelectorAll('div > div');

		let unknownName = 'unknownName';
		let unknownNameIdx = 0;

		let objToBuild = {};
		childDivs.forEach(eachDiv => {
			let propertyName = eachDiv.getAttribute("propertyName");
			if (_.isNil(propertyName) || propertyName === "") {
				console.warn('Invalid propertyName of div found as child of ', content, ' replace with ', unknownName);
				propertyName = unknownName;

				unknownName = 'unknownName_' + unknownNameIdx;
				unknownNameIdx++;
			}
			let propertyNameAsStr = propertyName;
			let childElementCount = eachDiv.childElementCount;
			if (childElementCount === 0) {
				let val = eachDiv.innerHTML;

				//diss out all tabs and newline
				val = val.replace(/[\t\n\r]/gm,'');

				objToBuild[propertyNameAsStr] = val;
				return;
			}

			let here = this.iterateDivsAndBuildObj(eachDiv);
			objToBuild[propertyNameAsStr] = here;
		})
		console.log('at dept', dept, 'div ', content, 'got objToBuild', objToBuild);
		dept--;
		return objToBuild;
	}
}
let dept = 0;
function cloneStr(str: string, time: number) {
	let sum = ""
	while (time > 0) {
		sum += str;
		time--;
	}
	return sum;
}
