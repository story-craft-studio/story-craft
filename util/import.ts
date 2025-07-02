// Handles importing HTML source code into story objects ready to be saved to
// the store. This works on both published story files and archives.
//
// It's important that this code be as efficient as possible, as it directly
// affects startup time in the Twine desktop app. This module moves data from
// the filesystem into local storage, and the app can't begin until it's done.

import {v4 as uuid} from '@lukeed/uuid';
import defaults from 'lodash/defaults';
import {Passage, passageDefaults, Story, storyDefaults, StorySetting} from '../store/stories';
import {CommandType, PassageCommand} from "../common/passage-command/PassageCommandTypeDef";
import ImportHelperGenerator from "./import-helper-generator";

/**
 * An imported story, which may contain incomplete or malformed data.
 */
export interface ImportedStory extends Omit<Partial<Story>, 'passages'> {
	passages: Partial<Passage>[];
}

/**
 * HTML selectors used to find data in HTML format.
 */
const selectors = {
	passage: 'tw-passage',
	story: 'tw-story',
	script: '[role=script]',
	stylesheet: '[role=stylesheet]',
	storyData: 'tw-storydata',
	tagColors: 'tw-tag',
	passageData: 'tw-passagedata'
};

/**
 * Convenience function to convert a string value to an float.
 */
function float(stringValue: string) {
	return parseFloat(stringValue);
}

/**
 * Convenience function to query an element by a selector.
 */
function query(el: Element, selector: string) {
	return Array.from(el.querySelectorAll(selector));
}

/**
 * Convenience function to parse a string like "100,50".
 */
function parseDimensions(raw: any): [string, string] | undefined {
	if (typeof raw !== 'string') {
		return undefined;
	}

	const bits = raw.split(',');

	if (bits.length === 2) {
		return [bits[0], bits[1]];
	}

	return undefined;
}

function importPassageCommandsFromPassageHTML(passageElement: Element) {
	let psgCont = passageElement.querySelector('.passage-container');
	if (!psgCont) {
		console.error('missing passage-container from imported story, passage html Element = ', passageElement);
		return [];
	}

	let divs = psgCont.querySelectorAll('div');
	if (!divs?.length) {
		console.warn('passage element has empty commands', passageElement);
		return [];
	}

	let validDivs: HTMLDivElement[] = [];
	divs.forEach(eachDiv => {
		if (!eachDiv.getAttribute('step')) {
			console.warn('Found div under passage-container without "step" attribute, a valid passage command must have one', eachDiv);
			return;
		}
		validDivs.push(eachDiv);
	})

	if (!validDivs?.length) {
		console.warn('passage element has empty valid commands', passageElement, 'all command elements = ', divs);
		return [];
	}

	let commands: PassageCommand[] = [];
	validDivs.forEach((eachDiv, i) => {
		let className = eachDiv.className || "";

		let stepId: any = eachDiv.getAttribute('step');
		// @ts-ignore
		if (isNaN(stepId)) {
			console.warn('eachDiv ', eachDiv, 'has non number step ', stepId);
			stepId = i;
		}
		let commandIndex = Number(stepId);

		let contentAsJSON: string = eachDiv.getAttribute('content') || '';
		let contentAsJSONDecoded: string = decodeURI(contentAsJSON);
		let contentParsedFromJSON;
		try {
			contentParsedFromJSON = JSON.parse(contentAsJSONDecoded) || {};
		} catch (e) {
			console.warn('contentAsJSON ', contentAsJSON, contentAsJSONDecoded, 'is not a valid json, eachDiv =', eachDiv);
			contentParsedFromJSON = {};
		}

		let typeText: string = eachDiv.getAttribute('type') || "";
		let matched = Object.values(CommandType).some(someEnumVal => {
			return (someEnumVal + '') === typeText;
		})
		if (!matched) {
			console.error('unknown Passage command type ', typeText, 'they will be reverted to characterDialog');
			typeText = CommandType.characterDialog
		}

		let isCommand = typeText === CommandType.customCommand;//className.includes('macro');
		if (isCommand) {
			commands.push({
				type: CommandType.customCommand,
				content: {
					text: eachDiv.textContent?.trim(),
					...contentParsedFromJSON,
				},
				id: commandIndex + '',
			})
			return;
		}

		let textContent = eachDiv.textContent;
		// textContent = textContent.replaceAll('\t', '');

		commands.push({
			type: typeText as CommandType,
			content: {
				text: textContent,
				...contentParsedFromJSON,
			},
			id: commandIndex + '',
		})
	});

	return commands;
}

/**
 * Converts a DOM <tw-storydata> element to a story object matching the format
 * in the store. This *may* be missing data, or data it returns may be
 * malformed. This function does its best to reflect the contents of the
 * element.
 */
function domToObject(storyEl: Element): ImportedStory {
	const startPassagePid = storyEl.getAttribute('startnode');
	let startPassageId: string | undefined = undefined;
	const story: ImportedStory = {
		ifid: storyEl.getAttribute('ifid') ?? uuid().toUpperCase(),
		id: uuid(),
		lastUpdate: undefined,
		name: storyEl.getAttribute('name') ?? undefined,
		storyFormat: storyEl.getAttribute('format') ?? undefined,
		storyFormatVersion: storyEl.getAttribute('format-version') ?? undefined,
		script: query(storyEl, selectors.script)
			.map(el => el.textContent)
			.join('\n'),
		stylesheet: query(storyEl, selectors.stylesheet)
			.map(el => el.textContent)
			.join('\n'),
		tags: storyEl.getAttribute('tags')
			? storyEl.getAttribute('tags')!.split(/\s+/)
			: [],
		zoom: parseFloat(storyEl.getAttribute('zoom') ?? '1'),
		tagColors: query(storyEl, selectors.tagColors).reduce((result, el) => {
			const tagName: string | null = el.getAttribute('name');

			if (typeof tagName !== 'string') {
				return result;
			}

			return {...result, [tagName]: el.getAttribute('color')};
		}, {}),
		passages: query(storyEl, selectors.passageData).map(passageEl => {
			console.log('passageEl', passageEl);
			const id = uuid();
			const position = parseDimensions(passageEl.getAttribute('position'));
			const size = parseDimensions(passageEl.getAttribute('size'));

			if (passageEl.getAttribute('pid') === startPassagePid) {
				startPassageId = id;
			}

			let commands = importPassageCommandsFromPassageHTML(passageEl);
			console.log('passageEl', passageEl, 'has commands', commands);
			return {
				id,
				commands,
				left: position ? float(position[0]) : undefined,
				top: position ? float(position[1]) : undefined,
				width: size ? float(size[0]) : undefined,
				height: size ? float(size[1]) : undefined,
				tags: passageEl.getAttribute('tags')
					? passageEl.getAttribute('tags')!.split(/\s+/)
					: [],
				name: passageEl.getAttribute('name') ?? undefined,
				//text: passageEl.textContent ?? undefined
			};
		})
	};

	story.startPassage = startPassageId;
	return story;
}

/**
 * Imports stories from HTML. If there are any missing attributes in the HTML,
 * defaults will be applied.
 */
export function importStories(
	html: string,
	lastUpdateOverride?: Date
): Story[] {
	const nodes = document.createElement('div');

	nodes.innerHTML = html;

	return query(nodes, selectors.storyData).map(storyEl => {
		const importedStory = domToObject(storyEl);

		// Merge in defaults. We can't use object spreads here because undefined
		// values would override defaults.

		const story: Story = defaults(importedStory, {id: uuid()}, storyDefaults());

		// Override the last update as requested.

		if (lastUpdateOverride) {
			story.lastUpdate = lastUpdateOverride;
		}

		// Merge in passage defaults. We don't need to set ID here--domToObject did
		// this for us.

		story.passages = story.passages.map(passage =>
			defaults(passage, passageDefaults(), {story: story.id})
		);

		let storySetting = ImportHelperGenerator.readObjectFromElement('storySetting', nodes);
		if (!storySetting) {
			console.warn('no storySetting found in imported html ', nodes);
		}
		else {
			story.storySetting = storySetting as StorySetting;
		}
		return story;
	});
}
