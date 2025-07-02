import * as React from 'react';
import {useParams} from 'react-router-dom';
import {MainContent} from '../../components/container/main-content';
import {DocumentTitle} from '../../components/document-title/document-title';
import {DialogsContextProvider} from '../../dialogs';
import {addPassageEditors, useDialogsContext} from '../../dialogs';
import {Story, StorySetting, storyWithId, updateStory, selectPassage, assignPassageColors} from '../../store/stories';
import {
	StoriesActionOrThunk,
	UndoableStoriesContextProvider,
	useUndoableStoriesContext
} from '../../store/undoable-stories';
import {MarqueeablePassageMap} from './marqueeable-passage-map';
import {PassageFuzzyFinder} from './passage-fuzzy-finder';
import {StoryEditToolbar} from './toolbar';
import {useInitialPassageCreation} from './use-initial-passage-creation';
import {usePassageChangeHandlers} from './use-passage-change-handlers';
import {useViewCenter} from './use-view-center';
import {useZoomShortcuts} from './use-zoom-shortcuts';
import {useZoomTransition} from './use-zoom-transition';
import './story-edit-route.css';
import GlobalPointerEvent from "../../common/GlobalPointerEvent";
import {PointerEventHandler, useEffect} from "react";
import {CharacterMgr} from "./toolbar/settings/character-settings/character-mgr";
import _ from "lodash";
import {CharacterDialogSettingMgr} from "../../common/character-dialog-setting-mgr";
import {StartMenuSettingMgr} from "../../common/start-menu-setting-mgr";
import {EndMenuSettingMgr} from "../../common/end-menu-setting-mgr";
import ToolbarNavigator from './toolbar-navigator';
import { SettingsProvider } from './toolbar/settings/settings-context';
import { GeneralSettings } from './toolbar/settings/general-settings/general-settings';
import { TutorialProvider } from '../tutorial/tutorial-context';
import { StoryEditTopBar } from './top-bar/story-edit-top-bar';
import { ChoiceMenuSettingMgr } from '../../common/choice-menu-setting-mgr';

const nilOrEmpty  = (obj: any) => {
	return _.isNil(obj) || _.isEmpty(obj);
}

function onStoryOpen(args: {storyId: string, stories: Story[], story: Story, dispatch: (actionOrThunk: StoriesActionOrThunk, annotation?: string) => void}) {
	const {storyId, stories, story, dispatch} = args;
	if (!story) return;

	let needChange = false;
	let curStorySetting = story.storySetting;

	if (!curStorySetting) {
		// @ts-ignore
		curStorySetting = {};
	}

	// Ensure startMenuSetting is valid
	curStorySetting.startMenuSetting = StartMenuSettingMgr.fromRawObj(curStorySetting.startMenuSetting, story).toRaw();
	curStorySetting.choiceMenuSetting = ChoiceMenuSettingMgr.fromRawObj(curStorySetting.choiceMenuSetting, story).toRaw();
	// needChange = true;
	// if (nilOrEmpty(curStorySetting.startMenuSetting)) {
	// 	console.log('generating startMenu settings..');
	// 	let menuSettings = StartMenuSettingMgr.createDefaultSettings(story);
	// 	curStorySetting.startMenuSetting = menuSettings.toRaw();
	// 	needChange = true;
	// }

	if (nilOrEmpty(curStorySetting.endMenuSetting)) {
		console.log('generating endMenu settings..');
		let menuSettings = EndMenuSettingMgr.createDefaultSettings(story);
		curStorySetting.endMenuSetting = menuSettings.toRaw();
		needChange = true;
	}

	if (nilOrEmpty(curStorySetting.characterDialogSetting)) {
		console.log('generating dialog settings..');
		let diaSettings = CharacterDialogSettingMgr.createDefaultSettings();
		curStorySetting.characterDialogSetting = diaSettings.toRaw();
		needChange = true;
	}

	if (nilOrEmpty(curStorySetting.characterSetting)) {
		console.log('characterSetting set to empty');
		CharacterMgr.clear();
	}
	else {
		CharacterMgr.reloadCharacterSetting(curStorySetting.characterSetting, storyId);
	}

	// Assign random pastel colors to passages that don't have colors
	dispatch(assignPassageColors(story));

	if (!needChange) return;
	console.log('new curStorySetting', curStorySetting);
	dispatch(updateStory(stories, story, {storySetting: curStorySetting}))
}

export const InnerStoryEditRoute: React.FC = () => {
	const {storyId} = useParams<{storyId: string}>();
	const {stories, dispatch} = useUndoableStoriesContext();
	const story = storyWithId(stories, storyId || '');
	const {handleEditPassage} = usePassageChangeHandlers(story);
	const {dispatch: dialogsDispatch} = useDialogsContext();
	
	// Ref to track if we've already opened the first passage for this story
	const initialPassageOpened = React.useRef<{[storyId: string]: boolean}>({});
	
	useEffect(() => {
		if (_.isNil(storyId)) return;
		onStoryOpen({storyId, stories, story, dispatch});

		// Auto-open the first passage only if this story hasn't had a passage opened yet
		if (story && story.passages.length > 0 && !initialPassageOpened.current[storyId]) {
			// Sort passages prioritizing left first, then top
			const sortedPassages = [...story.passages].sort((a, b) => {
				if (a.left !== b.left) {
					return a.left - b.left;
				}
				return a.top - b.top;
			});
			
			// Select and open the first passage
			if (sortedPassages[0]) {
				// First select the passage
				dispatch(selectPassage(story, sortedPassages[0], true));
				
				// Then open the passage editor
				dialogsDispatch(addPassageEditors(story.id, [sortedPassages[0].id]));
				
				// Mark this story as having had its initial passage opened
				initialPassageOpened.current[storyId] = true;
			}
		}
	}, [storyId, story, stories, dispatch, dialogsDispatch]);

	const [fuzzyFinderOpen, setFuzzyFinderOpen] = React.useState(false);
	const mainContent = React.useRef<HTMLDivElement>(null);
	const {getCenter, setCenter} = useViewCenter(story, mainContent);
	const {
		handleDeselectPassage,
		handleDragPassages,
		handleSelectPassage,
		handleSelectRect
	} = usePassageChangeHandlers(story);
	const visibleZoom = useZoomTransition(story.zoom, mainContent.current);

	useZoomShortcuts(story);
	useInitialPassageCreation(story, getCenter);

	// @ts-ignore
	const _onPointerMove: React.PointerEventHandler<HTMLDivElement> = (ev: PointerEvent) => {
		GlobalPointerEvent.onMoveTo(ev.clientX, ev.clientY);
	}

	return (
		<TutorialProvider 
			showOnStart={false} 
			defaultPosition={{ x: 300, y: 100 }} 
			defaultSize={{ width: 500, height: 450 }}
			rightOffset={600}
		>
			<SettingsProvider storyId={story.id}>
				<div className="story-edit-route" onPointerMove={_onPointerMove}>
					<DocumentTitle title={story.name} />
					<StoryEditTopBar 
						story={story} 
						getCenter={getCenter} 
					/>
					<StoryEditToolbar
					getCenter={getCenter}
					onOpenFuzzyFinder={() => setFuzzyFinderOpen(true)}
					story={story}
					stories={stories}
				/>
				<MainContent grabbable padded={false} ref={mainContent}>
					<ToolbarNavigator story={story} />
					<MarqueeablePassageMap
						container={mainContent}
						formatName={story.storyFormat}
						formatVersion={story.storyFormatVersion}
						onDeselect={handleDeselectPassage}
						onDrag={handleDragPassages}
						onEdit={handleEditPassage}
						onSelect={handleSelectPassage}
						onSelectRect={handleSelectRect}
						passages={story.passages}
						startPassageId={story.startPassage}
						tagColors={story.tagColors}
						visibleZoom={visibleZoom}
						zoom={story.zoom}
					/>
					<PassageFuzzyFinder
						onClose={() => setFuzzyFinderOpen(false)}
						onOpen={() => setFuzzyFinderOpen(true)}
						open={fuzzyFinderOpen}
						setCenter={setCenter}
						story={story}
					/>
					</MainContent>
				</div>
				<GeneralSettings/>
			</SettingsProvider>
		</TutorialProvider>
	);
};

// This is a separate component so that the inner one can use
// `useDialogsContext()` and `useUndoableStoriesContext()` inside it.

export const StoryEditRoute: React.FC = () => (
	<UndoableStoriesContextProvider>
		<DialogsContextProvider>
			<InnerStoryEditRoute />
		</DialogsContextProvider>
	</UndoableStoriesContextProvider>
);
