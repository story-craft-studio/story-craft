import React, {useEffect, useRef, useState} from 'react';
import {Box, CircularProgress, SxProps} from '@mui/material';
import parser from 'html-react-parser';
import {Passage, Story} from '../../../store/stories';
import {PassageCommand} from '../../../common/passage-command/PassageCommandTypeDef';
import {Character} from '../../../routes/story-edit/toolbar/settings/character-settings/character-typedef';
import EvtMgr, {EventName} from '../../../common/evt-mgr';
import {useDialogsContext} from '../../../dialogs';
import {DemoGameManager} from '../../../../custom-story/src/core/DemoGameManager';
import {
	StartMenuSettings,
	EndMenuSettings,
	ChoiceMenuSettings
} from '../../../../custom-story/src/rendering/interfaces';
import StyleSheetToDisplayPassageCommandGenerator from '../../../util/publish/StyleSheetToDisplayPassageCommandGenerator';
import {splitPassageCommandsToHTML} from '../../../util/publish';
import SupportCharacterImgContainerGenerator from '../../../util/publish/SupportHTMLGenerators/character-element-generator/support-character-img-container-generator';
import {CharacterShowCommandRunner} from '../../../../shared/passage/run-by-command-type/character-show-command-runner';
import DemoSettingsModalFakeStoryGenerator from './demo-settings-modal-fake-story-generator';
import StringUtil from '../../../util/StringUtil';
import DelayTaskUtil from '../../../util/DelayTaskUtil';
import {LayoutMode} from '../../../../custom-story/src/core/LayoutMode';
import {EventBus} from '../../../../custom-story/src/phaser/core/EventBus';
import {GameEvent} from '../../../../custom-story/src/core/GameEvent';
import {GameState} from '../../../../custom-story/src/core/GameState';
import { DialogShowPosition } from '../../../../custom-story/src/types/character-dialog.types';

// Styles
const modalContentContainerStyle: SxProps = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	p: 4
};

const loadingOverlayStyle: SxProps = {
	position: 'absolute',
	top: 0,
	left: 0,
	width: '100%',
	height: '100%',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	backgroundColor: 'rgba(0, 0, 0, 0.6)',
	zIndex: 10
};

const storyContainerStyle: SxProps = {
	width: '60vw',
	aspectRatio: 1.8,
	margin: 0,
	zIndex: 0,
	overflow: 'hidden',
	position: 'relative',
	backgroundColor: '#888888'
};

const canvasContainerStyle: SxProps = {
	position: 'absolute',
	top: 0,
	left: 0,
	width: '100%',
	height: '100%',
	zIndex: 5,
	pointerEvents: 'none',
	'& #canvas-container': {
		position: 'absolute !important',
		top: '0 !important',
		left: '0 !important',
		width: '100% !important',
		height: '100% !important',
		pointerEvents: 'auto'
	}
};

// Utility instances
const charImgContGenerator = new SupportCharacterImgContainerGenerator();
const characterShowCommandRunner = new CharacterShowCommandRunner();
const styleSheetGenerator = new StyleSheetToDisplayPassageCommandGenerator();

// Interfaces
interface DialogState {
	isDialogOpen: boolean;
	isStartMenuOpen: boolean;
	isEndMenuOpen: boolean;
	isChoiceMenuOpen: boolean;
}

interface Props {
	openDemoModal: boolean;
	anyDialogOpening: boolean;
	useDemoCharacterIndex?: number;
	useDemoSkinIndex?: number;
	curStory: Story | undefined;
}

export const DemoSettingsModal: React.FC<Props> = ({
	openDemoModal,
	anyDialogOpening,
	useDemoCharacterIndex: initialCharacterIndex = 0,
	useDemoSkinIndex: initialSkinIndex = 0,
	curStory
}) => {
	// State
	const [uid] = useState(`DemoSettingsModal-${StringUtil.randomString()}`);
	const [isGameManagerReady, setIsGameManagerReady] = useState(false);
	const [isSettingsLoading, setIsSettingsLoading] = useState(false);
	const [demoCharacterIndex, setDemoCharacterIndex] = useState(
		initialCharacterIndex
	);
	const [demoSkinIndex, setDemoSkinIndex] = useState(initialSkinIndex);
	const [fakeStory, setFakeStory] = useState<Story | undefined>();
	const [fakePassage, setFakePassage] = useState<Passage | undefined>();
	const [fakeCharacterShowCommand, setFakeCharacterShowCommand] = useState<
		PassageCommand | undefined
	>();
	const [fakeCharacterDialogCommand, setFakeCharacterDialogCommand] = useState<
		PassageCommand | undefined
	>();
	const [fakeGeneratedPassageHtml, setFakeGeneratedPassageHtml] = useState('');
	const [fakeCharImgContHtml, setFakeCharImgContHtml] = useState('');

	// Refs
	const gameManagerRef = useRef<DemoGameManager | null>(null);
	const storyContainerRef = useRef<HTMLDivElement | null>(null);
	const canvasParentRef = useRef<HTMLElement | null>(null);
	const demoContRef = useRef<HTMLDivElement | null>(null);
	const prevDialogStateRef = useRef<DialogState>({
		isDialogOpen: false,
		isStartMenuOpen: false,
		isEndMenuOpen: false,
		isChoiceMenuOpen: false
	});

	const {dialogs} = useDialogsContext();
	const isDialogSettingsOpen = dialogs.activeDialogs.some(
		d => d.id === 'DialogSettings'
	);
	const isStartMenuSettingsOpen = dialogs.activeDialogs.some(
		d => d.id === 'StartMenuSettings'
	);
	const isEndMenuSettingsOpen = dialogs.activeDialogs.some(
		d => d.id === 'EndMenuSettings'
	);
	const isChoiceMenuSettingsOpen = dialogs.activeDialogs.some(
		d => d.id === 'ChoiceMenuSettings'
	);

	const isLoading = !isGameManagerReady || isSettingsLoading;

	// Event Handlers
	const handleSettingsChangeIncoming = () => setIsSettingsLoading(true);
	const handleSettingsChangeApplied = () => setIsSettingsLoading(false);
	const handleDialogSettingsMounted = () =>
		isGameManagerReady && showDemoCharacter();
	const handleCharacterIndexChange = ({
		characterIndex
	}: {
		characterIndex: number;
	}) => setDemoCharacterIndex(characterIndex || 0);
	const handleSkinIndexChange = ({skinIndex}: {skinIndex: number}) =>
		setDemoSkinIndex(skinIndex || 0);

	// Initialize and cleanup event listeners
	useEffect(() => {
		EvtMgr.on(
			EventName.twineGameSettingsChangeIncoming,
			handleSettingsChangeIncoming
		);
		EvtMgr.on(
			EventName.twineGameSettingsChangeApplied,
			handleSettingsChangeApplied
		);
		EvtMgr.on(EventName.dialogSettingsMounted, handleDialogSettingsMounted);
		EvtMgr.on(
			EventName.demoModalChangeCharacterIndex,
			handleCharacterIndexChange
		);
		EvtMgr.on(EventName.demoModalChangeSkinIndex, handleSkinIndexChange);

		return () => {
			EvtMgr.off(
				EventName.twineGameSettingsChangeIncoming,
				handleSettingsChangeIncoming
			);
			EvtMgr.off(
				EventName.twineGameSettingsChangeApplied,
				handleSettingsChangeApplied
			);
			EvtMgr.off(EventName.dialogSettingsMounted, handleDialogSettingsMounted);
			EvtMgr.off(
				EventName.demoModalChangeCharacterIndex,
				handleCharacterIndexChange
			);
			EvtMgr.off(EventName.demoModalChangeSkinIndex, handleSkinIndexChange);
		};
	}, [isGameManagerReady]);

	// Sync demo character and skin indices with props
	useEffect(() => {
		setDemoCharacterIndex(initialCharacterIndex);
	}, [initialCharacterIndex]);

	useEffect(() => {
		setDemoSkinIndex(initialSkinIndex);
	}, [initialSkinIndex]);

	// Initialize fake story and passage data
	useEffect(() => {
		if (!openDemoModal || !curStory) {
			resetState();
			return;
		}

		const newFakeStory =
			DemoSettingsModalFakeStoryGenerator.addExtraFakeDetailToStory(curStory);
		setFakeStory(newFakeStory);

		const {fakePassage, fakeShowCharacterCmd, fakeDialogCmd} =
			DemoSettingsModalFakeStoryGenerator.genFakePassage(newFakeStory);
		setFakePassage(fakePassage);
		setFakeCharacterShowCommand(fakeShowCharacterCmd);
		setFakeCharacterDialogCommand(fakeDialogCmd);

		let passageHtml = splitPassageCommandsToHTML({
			story: newFakeStory,
			p: fakePassage,
			genStyleSheet: true
		}).passageAsHtml.replace('customhidden="true"', '');
		setFakeGeneratedPassageHtml(passageHtml);

		let charHtml = charImgContGenerator.gen({story: newFakeStory});
		charHtml +=
			'\n<!-- SupportCharacterImgContainerGenerator style start -->\n';
		charHtml += charImgContGenerator.genStyle({story: newFakeStory});
		charHtml += '\n<!-- SupportCharacterImgContainerGenerator style end -->\n';
		setFakeCharImgContHtml(charHtml);
	}, [
		openDemoModal,
		curStory,
		isDialogSettingsOpen,
		isStartMenuSettingsOpen,
		isEndMenuSettingsOpen,
		isChoiceMenuSettingsOpen
	]);

	// Initialize GameManager
	const initializeGameManager = async (): Promise<DemoGameManager | null> => {
		if (gameManagerRef.current && isGameManagerReady)
			return gameManagerRef.current;
		if (!storyContainerRef.current) return null;

		const canvasParent = storyContainerRef.current.querySelector(
			'#canvas-parent-container'
		) as HTMLElement;
		if (!canvasParent) return null;

		try {
			gameManagerRef.current =
				gameManagerRef.current || DemoGameManager.getInstance();
			// @ts-ignore
			if (curStory) GameState.getInstance().setCurrentStory(curStory);

			gameManagerRef.current.initialize(canvasParent);
			gameManagerRef.current.start(() => {
				setIsGameManagerReady(true);
				updateDemoDisplay();
			});

			return gameManagerRef.current;
		} catch (error) {
			console.error('Failed to initialize GameManager:', error);
			setIsGameManagerReady(false);
			return null;
		}
	};

	// Reset state when modal is closed
	const resetState = () => {
		setFakeGeneratedPassageHtml('');
		setFakeCharImgContHtml('');
		setFakeStory(undefined);
		setFakePassage(undefined);
		setFakeCharacterShowCommand(undefined);
		setFakeCharacterDialogCommand(undefined);

		if (gameManagerRef.current) {
			gameManagerRef.current.destroy();
			gameManagerRef.current = null;
		}
		setIsGameManagerReady(false);
	};

	// Show demo character
	const showDemoCharacter = async (
		dialogTitle?: string,
		dialogContent?: string
	) => {
		if (!isGameManagerReady || !fakeStory || !gameManagerRef.current) return;

		const character = fakeStory.storySetting?.characterSetting?.characters?.[
			demoCharacterIndex
		] as Character;
		if (!character) return;

		const skin = character.skins?.[demoSkinIndex] || character.skins?.[0];
		if (!skin) return;

        console.log('showDemoCharacter', isGameManagerReady, gameManagerRef.current);
		await gameManagerRef.current.hideAllCharacters();
		await gameManagerRef.current.showCharacter(character, {
			stageSide: fakeCharacterShowCommand?.content?.position,
			transition: fakeCharacterShowCommand?.content?.transition,
			skinIndex: demoSkinIndex
		});

		if (dialogTitle && dialogContent) {
			gameManagerRef.current.showCharacterDialog({dialogTitle, dialogContent, dialogTitlePosition: DialogShowPosition.left});
		}
	};

	// Show demo dialog
	const showDemoDialog = async (
		title: string = 'Character Name',
		content: string = 'This is a sample dialog shown in the demo canvas. You can customize the appearance and content of this dialog in the settings.'
	) => {
        console.log('showDemoDialog', isGameManagerReady, gameManagerRef.current);
		if (!isGameManagerReady || !gameManagerRef.current) return;
		gameManagerRef.current.hideAllMenus();
		gameManagerRef.current.showCharacterDialog({
			dialogTitlePosition: DialogShowPosition.left,
			dialogTitle: title,
			dialogContent: content,
		});
	};

	// Show demo start menu
	const showDemoStartMenu = async (
		settings: StartMenuSettings | undefined = undefined
	) => {
		if (!isGameManagerReady || !gameManagerRef.current) return;
		gameManagerRef.current.hideAllMenus();
		gameManagerRef.current.hideAllCharacters();
		gameManagerRef.current.showStartMenu({settings});
	};

	// Show demo end menu
	const showDemoEndMenu = async (
		settings: EndMenuSettings | undefined = undefined
	) => {
		if (!isGameManagerReady || !gameManagerRef.current) return;
		gameManagerRef.current.hideAllMenus();
		gameManagerRef.current.hideAllCharacters();
		gameManagerRef.current.showEndMenu({settings});
	};

	// Show demo choice menu
	const showDemoChoiceMenu = async (
		settings: ChoiceMenuSettings | undefined = undefined
	) => {
		if (!isGameManagerReady || !gameManagerRef.current) return;
		gameManagerRef.current.hideAllMenus();
		gameManagerRef.current.hideAllCharacters();
		gameManagerRef.current.showChoiceMenu({
			title: "Choose a route",
			choiceOptions: {
				choices: [
					{
						id: "passage1",
						text: "Passage 1",
					},
					{
						id: "passage2",
						text: "Passage 2",
					}
				]
			},
			settings: settings,
		});
	};


	// Update demo display based on dialog state
	const updateDemoDisplay = () => {
		if (!fakeStory) return;
		if (isDialogSettingsOpen) {
			showDemoCharacter();
			showDemoDialog();
		} else if (isStartMenuSettingsOpen) {
			showDemoStartMenu(fakeStory.storySetting?.startMenuSetting);
		} else if (isEndMenuSettingsOpen) {
			showDemoEndMenu(fakeStory.storySetting?.endMenuSetting);
		} else if (isChoiceMenuSettingsOpen) {
			showDemoChoiceMenu(fakeStory.storySetting?.choiceMenuSetting);
		} else {
			showDemoDialog();
			showDemoCharacter();
		}
	};

	// Initialize and cleanup GameManager
	useEffect(() => {
		let isMounted = true;

		const initialize = async () => {
			if (!openDemoModal || !storyContainerRef.current) return;
			await initializeGameManager();
		};

		initialize();

		return () => {
			isMounted = false;
			if (gameManagerRef.current && !openDemoModal) {
				gameManagerRef.current.destroy();
				gameManagerRef.current = null;
				canvasParentRef.current = null;
				setIsGameManagerReady(false);
				setIsSettingsLoading(false);
			}
		};
	}, [openDemoModal]);

	// Handle dialog state changes
	useEffect(() => {
		if (!isGameManagerReady || !gameManagerRef.current || !fakeStory) return;

		const dialogStateChanged =
			prevDialogStateRef.current.isDialogOpen !== isDialogSettingsOpen ||
			prevDialogStateRef.current.isStartMenuOpen !== isStartMenuSettingsOpen ||
			prevDialogStateRef.current.isEndMenuOpen !== isEndMenuSettingsOpen ||
			prevDialogStateRef.current.isChoiceMenuOpen !== isChoiceMenuSettingsOpen;

		if (dialogStateChanged) {
			updateDemoDisplay();
			prevDialogStateRef.current = {
				isDialogOpen: isDialogSettingsOpen,
				isStartMenuOpen: isStartMenuSettingsOpen,
				isEndMenuOpen: isEndMenuSettingsOpen,
				isChoiceMenuOpen: isChoiceMenuSettingsOpen
			};
		}
	}, [
		isDialogSettingsOpen,
		isStartMenuSettingsOpen,
		isEndMenuSettingsOpen,
		isChoiceMenuSettingsOpen,
		isGameManagerReady,
		fakeStory
	]);

	// Apply story settings
	useEffect(() => {
		if (!isGameManagerReady || !gameManagerRef.current || !fakeStory) return;

		try {
			const storyScene = gameManagerRef.current.getStoryScene();
			if (!storyScene) return;

			gameManagerRef.current
				.getRenderManager()
				.setLayoutMode(fakeStory.orientation as LayoutMode);

			EventBus.once(GameEvent.ON_STORY_SCENE_READY, () => {
				storyScene.applyStorySettings(fakeStory.storySetting);
				updateDemoDisplay();
			});

			storyScene.applyStorySettings(fakeStory.storySetting);
			gameManagerRef.current.changeBackground({bgColor: '#888888'});
		} catch (error) {
			console.error('Failed to apply settings:', error);
		}
	}, [
		fakeStory,
		isDialogSettingsOpen,
		isStartMenuSettingsOpen,
		isEndMenuSettingsOpen,
		isChoiceMenuSettingsOpen,
		isGameManagerReady
	]);

	// Show character and dialog when ready
	useEffect(() => {
		const taskId = `${uid}-runCharacterShowCommand`;
		if (
			!isGameManagerReady ||
			!fakeCharImgContHtml ||
			!demoContRef.current ||
			!fakeCharacterDialogCommand ||
			!fakeCharacterShowCommand ||
			prevDialogStateRef.current.isStartMenuOpen ||
			prevDialogStateRef.current.isEndMenuOpen ||
			prevDialogStateRef.current.isChoiceMenuOpen
		) {
			DelayTaskUtil.cancelDelayTask(taskId);
			return;
		}
		showDemoDialog();
		showDemoCharacter();
	}, [
		fakeCharacterShowCommand,
		demoSkinIndex,
		demoCharacterIndex,
		isGameManagerReady,
		fakeCharImgContHtml
	]);

	return (
		<Box
			ref={demoContRef}
			sx={{
				...modalContentContainerStyle,
				display: openDemoModal ? 'block' : 'none',
				left: anyDialogOpening ? 'calc(50% - 307px)' : '50%'
			}}
		>
			<Box
				id="demo-story-container"
				ref={storyContainerRef}
				sx={storyContainerStyle}
			>
				{isLoading && (
					<Box sx={loadingOverlayStyle}>
						<CircularProgress sx={{color: 'wheat'}} />
					</Box>
				)}
				{parser(
					styleSheetGenerator.gen({
						topElementSelector: 'div[id="demo-story-container"]'
					})
				)}
				{parser(fakeCharImgContHtml)}
				<Box id="story" role="main" sx={{width: '100%', height: '100%'}}>
					<Box id="passages" aria-live="polite">
						<Box
							id="passage-fakePassageName"
							data-passage="fakePassageName"
							className="passage"
						/>
					</Box>
				</Box>
				<Box className="passage-container">
					{parser(fakeGeneratedPassageHtml)}
				</Box>
				<Box
					id="canvas-parent-container"
					ref={el => {
						if (el) canvasParentRef.current = el as HTMLElement;
					}}
					sx={canvasContainerStyle}
				/>
			</Box>
		</Box>
	);
};

export default DemoSettingsModal;
