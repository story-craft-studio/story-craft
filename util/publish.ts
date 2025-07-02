import escape from 'lodash/escape';
import {Passage, Story} from '../store/stories';
import {AppInfo} from './app-info';
import {i18n} from './i18n';
import PassageCommandMgr from "../common/passage-command/PassageCommandMgr";
import {CommandType} from "../common/passage-command/PassageCommandTypeDef";
import SupportHTMLGeneratorMgr from "./publish/SupportHTMLGeneratorMgr";
import StyleSheetToDisplayPassageCommandGenerator from "./publish/StyleSheetToDisplayPassageCommandGenerator";
import _ from "lodash";
import { DefaultService } from '../_genApi/static-asset';
import ImportHelperGenerator from "./import-helper-generator";
import StoryEncoder from "./story-ecoder";

export interface PublishOptions {
	useDebug?: boolean; //set to true to enable the debug bar on the left. DEFAULT TRUE

	/**
	 * Options that will be passed as-is to the format in the `options` attribute
	 * of the published `<tw-storydata>` tag.
	 */
	formatOptions?: string;

	/**
	 * ID of the passage to start the story at. This overrides what is set at the
	 * story level.
	 */
	startId?: string;

	/**
	 * If true, publishing will proceed even if the story has no starting passage
	 * set and one wasn't set manually.
	 */
	startOptional?: boolean;

	/**
	 * If true, the story will be published with remix disabled.
	 */
	forceDisableRemix?: boolean;
}

/**
 * Returns a filename for an archive file.
 */
export function archiveFilename() {
	const timestamp = new Date().toLocaleString().replace(/[/:\\]/g, '.');

	return i18n.t('store.archiveFilename', {timestamp});
}

/**
 * Publishes an archive of stories, e.g. all stories in one file with no story
 * format binding.
 */
export function publishArchive(stories: Story[], appInfo: AppInfo) {
	return stories.reduce((output, story) => {
		// Force publishing even if there is no start point set.
		console.log('publishArchive..');
		return (
			output + publishStory(story, appInfo, {startOptional: true}) + '\n\n'
		);
	}, '');
}

/**
 * Publishes a passage to an HTML fragment. This takes a id argument because
 * passages are numbered sequentially in published stories, not with a UUID.
 */
export function publishPassage(passage: Passage, localId: number, passageContentAsHTML: string) {
	return (
		`<tw-passagedata pid="${escape(localId.toString())}" realpid="${escape(passage.id)}" ` +
		`name="${escape(passage.name)}" ` +
		`tags="${escape(passage.tags.join(' '))}" ` +
		`position="${passage.left},${passage.top}" ` +
		`size="${passage.width},${passage.height}">` +
		`${passageContentAsHTML}</tw-passagedata>`
	);
}

export const splitPassageCommandsToHTML = (option: {
	story: Story,
	p: Passage,
	genStyleSheet?: boolean, //default true,
}) => {
	let p = option.p;
	let story = option.story;
	let genStyleSheet = _.isNil(option.genStyleSheet) ? true : option.genStyleSheet;
	let cmds = p.commands;

	let passageAsHtml = ``;
	passageAsHtml += `<div nobr class="passage-container" name="start" realpid="${p.id}">\n`

	cmds.forEach((eachCmd, i) => {

		let contentAsJSON = eachCmd.content ? JSON.stringify(eachCmd.content) : "";
		let contentAsJSONEncoded = encodeURI(contentAsJSON);

		let generatedContent = PassageCommandMgr.genHTMLContentFor(story, p, eachCmd, eachCmd.content.text);
		if (_.isNil(generatedContent)) {
			generatedContent = '&nbsp;';
		}

		let isCharacterDialog = eachCmd.type === CommandType.characterDialog;

		let customhiddenAttr = 'customhidden="true"';
		let className = 'each-passage-command-container ';
		className += isCharacterDialog ? 'normal-link' : 'my-passage-command-descriptor';

		passageAsHtml += `	<div class="${className}" step="${i}" ${customhiddenAttr} type="${eachCmd.type}" content="${contentAsJSONEncoded}" >`;
		passageAsHtml += `${generatedContent}`;
		passageAsHtml += `</div>\n`;
	})

	if (genStyleSheet) {
		passageAsHtml += '<!--style sheet generating from each command ...-->'
		passageAsHtml += PassageCommandMgr.genStyleSheets(story, p);
		passageAsHtml += '<!--style sheet generated from each command  ! -->'
	}

	passageAsHtml += `</div>\n`;
	return {
		passageAsHtml,
	};

	//TODO: deal with link type like: (link: "End..")[(goto: "wait0")wait0]
}


const genScriptToTriggerCustomStoryScriptLoading = (story: Story): string => {

	let encoder = StoryEncoder.create();
	let storyJSON = encoder.encode(story);

	let replaceStringLiteralWithSpecialCharacter = encoder.replaceStringLiteralWithSpecialCharacter;
	return `
	<script>        
		function triggerSugarcubePassageCommandsLoading() {
            console.log('triggerCustomStoryScriptLoading..');
			
			// ofcourse doesn't work, no such thing as 'StoryEncoder' at game run..
			// var storyJSON = StoryEncoder.decode(storyJSON);
			
			var storyJSON = '${storyJSON}';
            storyJSON = decodeURI(storyJSON);
			
            //replace each tab with 4 spaces
            storyJSON = storyJSON.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');         
            
            //replace each new line with  <br/>
            storyJSON = storyJSON.replace(/(?:\\r\\n|\\r|\\n)/g, '<br/>');
            
            // replace each string literal marker with string literal
            // ..also dont use 'replaceAll' as they may not be supported
            let replaceStringLiteralWithSpecialCharacter = "${replaceStringLiteralWithSpecialCharacter}";  
            while(storyJSON.includes(replaceStringLiteralWithSpecialCharacter)){
			   storyJSON = storyJSON.replace(replaceStringLiteralWithSpecialCharacter, "'");
			}
            
			//console.log('storyJSON after decoded', storyJSON);
            var story;
			try {                
                story = JSON.parse(storyJSON);
			} catch (e) {
                console.error('Error with json parse: ', e, ' json string = ', storyJSON);
                return;
			}
                   
			//incase custom-story was loaded before this script get to run..
			if (window && window.CustomStory) {				
				setTimeout(() => {
					console.log('load customStory immediately..');
					window.CustomStory.loadStory(story);
				}, 100);
                return;
			}
            
			//incase custom-story was loaded AFTER this script get to run..
            document.addEventListener("eventSugarcubeInitialized", function (e) {                
				window.CustomStoryPreloadBundleData = {
					_story: story,
				}
            });
			console.log('wait for eventSugarcubeInitialized to load customStory..');
		}
		triggerSugarcubePassageCommandsLoading();        
	</script>
	`
}

/**
 * Does a "naked" publish of a story -- creating an HTML representation of it,
 * but without any story format binding.
 */
export function publishStory(
	story: Story,
	appInfo: AppInfo,
	{formatOptions, startId, startOptional, useDebug}: PublishOptions = {}
) {
	startId = startId ?? story.startPassage;

	useDebug = _.isNil(useDebug) ? true : useDebug;

	// Verify that the start passage exists.
	if (!startOptional) {
		if (!startId) {
			throw new Error(
				'There is no starting point set for this story and none was set manually.'
			);
		}

		if (!story.passages.find(p => p.id === startId)) {
			throw new Error(
				'The passage set as starting point for this story does not exist.'
			);
		}
	}

	// The id of the start passage as it is published (*not* a UUID).
	let startLocalId: number = 0;
	let passageData = '';

	passageData += genScriptToTriggerCustomStoryScriptLoading(story);

	story.passages.forEach((p, index) => {
		let {passageAsHtml} = splitPassageCommandsToHTML({story, p});
		passageData += publishPassage(p, index + 1, passageAsHtml);

		if (p.id === startId) {
			startLocalId = index + 1;
		}
	});

	passageData += new StyleSheetToDisplayPassageCommandGenerator().gen({useDebug});

	const tagData = Object.keys(story.tagColors).reduce(
		(result, tag) =>
			result +
			`<tw-tag name="${escape(tag)}" color="${escape(
				story.tagColors[tag]
			)}"></tw-tag>`,
		''
	);

	let htmlBeforeTwStoryData = '';

	//#region Support elements like modal, popup,..etc...
	//==========================
	htmlBeforeTwStoryData += '\n<!--SupportHTMLGeneratorMgr start generating content.. -->\n';
	htmlBeforeTwStoryData += new SupportHTMLGeneratorMgr().genHTML({
		story
	})
	htmlBeforeTwStoryData += '\n<!--SupportHTMLGeneratorMgr end generating content! -->\n';

	htmlBeforeTwStoryData += '\n<!--SupportHTMLGeneratorMgr start generating style.. -->\n';
	htmlBeforeTwStoryData += new SupportHTMLGeneratorMgr().genStyles({
		story
	})
	htmlBeforeTwStoryData += '\n<!--SupportHTMLGeneratorMgr end generating style! -->\n';
	//#endregion

	//#region anything that helps the import.ts module rebuild whole story from raw html
	//==========================
	htmlBeforeTwStoryData += ImportHelperGenerator.genHTMLContent({
		story
	})
	//#endregion

	// Remove MenuPlaceholderHtmlGenerator usage
	// Menu is now handled by GameManager through GameManager
	let htmlAfterTwStoryData = `
	<!--==================in-game-menu CANVAS VERSION=====================--->
	<!-- Menu is now rendered using GameManager through the GameManager -->
	<!--==================in-game-menu END!==========================--->
	`;
	
	return (
		`${htmlBeforeTwStoryData}` +
		`<tw-storydata name="${escape(story.name)}" ` +
		`startnode="${startLocalId || ''}" ` +
		`creator="${escape(appInfo.name)}" ` +
		`creator-version="${escape(appInfo.version)}" ` +
		`format="${escape(story.storyFormat)}" ` +
		`format-version="${escape(story.storyFormatVersion)}" ` +
		`ifid="${escape(story.ifid)}" ` +
		`options="${escape(formatOptions)}" ` +
		`tags="${escape(story.tags.join(' '))}" ` +
		`zoom="${escape(story.zoom.toString())}" hidden>` +
		`<style role="stylesheet" id="twine-user-stylesheet" ` +
		`type="text/twine-css">` +
		story.stylesheet +
		`</style>` +
		`<script role="script" id="twine-user-script" ` +
		`type="text/twine-javascript">` +
		story.script +
		`</script>` +
		tagData +
		passageData +
		`</tw-storydata>\n` +
		`${htmlAfterTwStoryData}`
	);
}

/**
 * Publishes a story and binds it to the source of a story format.
 */
export async function publishStoryWithFormat(
	story: Story,
	formatSource: string,
	appInfo: AppInfo,
	opt: PublishOptions = {}
) {
	if (!formatSource) {
		throw new Error('Story format source cannot be empty.');
	}

	const {formatOptions, startId, useDebug} = opt;

	let output = formatSource;

	// We use function replacements to protect the data from accidental
	// interactions with the special string replacement patterns.

	console.log('publishStoryWithFormat..', opt);
	output = output.replace(/{{STORY_NAME}}/g, () => escape(story.name));
	output = output.replace(/{{STORY_DATA}}/g, () =>
		publishStory(story, appInfo, {formatOptions, startId, useDebug})
	);

	const bundleDev = `custom-story/dist/app-bundle.min.js`;
	const bundleLive = `create/custom-story/dist/app-bundle.min.js`

	console.log('Attempting to load custom story bundle from:', bundleDev);
	let customStoryScript;
	try {
		const response = await fetch(bundleDev);
		console.log('Bundle fetch response status:', response.status);
		if (!response.ok) {
			console.error('Failed to fetch dev bundle, response:', response);
		}
		customStoryScript = await response.text();
		console.log('Bundle content length:', customStoryScript?.length);
	} catch (error: any) {
		console.error('Error loading custom story bundle:', error);
		throw new Error(`Failed to load custom story bundle: ${error.message}`);
	}

	// Add content check
	if (!customStoryScript?.trim()) {
		console.error('Empty custom story script loaded. Check bundle paths:', {
			bundleDev,
			bundleLive,
			env: process.env.NODE_ENV
		});
	}

	//wrap these stuffs in something to avoid duplicated name with storyFormat..
	//..which, remind you, was also compiled in quite similar way.
	customStoryScript =
		'window.CustomStoryStart = function () {\n'
		+ '\n/* customStoryScript start*/\n'
	    + customStoryScript
		+ '\n/* customStoryScript end*/\n'
	    + '}\n'
		+ 'window.CustomStoryStart();';

	output = output.replace(/{{BUILD_CUSTOM_SOURCE}}/g,
		() => customStoryScript
	)

	return output;
}


export async function syncAndGetGameId(storyId) {
	// Check if story key id exists in local storage
	const storyKeys = JSON.parse(localStorage.getItem('StoryKeys') || '{}');
	if (storyKeys[storyId]) {
		return storyKeys[storyId]; // Return immediately if gameId exists
	} else {
		// Request a new game id and save to local storage
		try {
			const gameId = await DefaultService.postApiCreateNewGame();
			storyKeys[storyId] = gameId;
			localStorage.setItem('StoryKeys', JSON.stringify(storyKeys));
			return gameId; // Return the newly created gameId
		} catch (error) {
			console.error('Error creating new game:', error);
			throw error; // Re-throw the error to be handled by the caller
		}
	}
}
