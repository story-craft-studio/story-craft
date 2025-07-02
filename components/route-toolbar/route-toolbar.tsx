import { IconHelp, IconPlayerPlay, IconInfoCircle } from '@tabler/icons';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs';
import { IconButton } from '../control/icon-button';
import { BackButton } from './back-button';
import './route-toolbar.css';
import { useStoryLaunch } from '../../store/use-story-launch';
import { CardButton } from '../control/card-button';
import { CardContent } from '../control/card-content';
import { IconX } from '@tabler/icons';
import { Story } from "../../store/stories";
import { TestUIModal } from './test-ui-modal';
import { IconTestPipe } from '@tabler/icons';
import { useDialogsContext } from '../../dialogs';
import Userbox from "../auth/Userbox";
import { ZoomButtons } from '../../routes/story-edit/toolbar/zoom-buttons';
import { UndoRedoButtons } from '../../routes/story-edit/toolbar/undo-redo-buttons';
import {
	Box,
	Button,
	Tooltip,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { PublishGamePopup } from '../../util/publish/publish-game-popup';
import { IconFileTwee } from '../image/icon';

import { importStories } from '../../util/import';
import { useNavigate } from 'react-router-dom';
import { useStoriesContext } from '../../store/stories';
import CreateIcon from '@mui/icons-material/Create';
import { CircularProgress } from '@mui/material';
import { unusedName } from '../../util/unused-name';
import { createStoryFromTemplate } from '../../util/create-template';
import { useStoryTemplate } from '../../store/use-story-template';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useTutorial } from '../../routes/tutorial';



export interface RouteToolbarProps {
	helpUrl?: string;
	pinnedControls?: React.ReactNode;
	tabs: Record<string, React.ReactNode>;
	story?: Story;
}

export const RouteToolbar: React.FC<RouteToolbarProps> = props => {
	const { helpUrl = 'https://twinery.org/2guide', pinnedControls, tabs, story } = props;
	const { t } = useTranslation();
	const { playStory } = useStoryLaunch();
	const [playError, setPlayError] = React.useState<Error | undefined>(undefined);
	const { dispatch } = useDialogsContext();
	const navigate = useNavigate();
	const { dispatch: storiesDispatch, stories } = useStoriesContext();
	const { createFromTemplate, isCreating, error: templateError, clearError } = useStoryTemplate();

	const { toggleTutorial, closeTutorial } = useTutorial();



	function handlePublishGame() {
		if (!story) {
			throw new Error('No story provided to publish');
		}

		dispatch({ type: 'addDialog', component: PublishGamePopup, props: { story } })
	}

	async function handlePlay() {
		if (!props.story) {
			console.error('cant play cuz no story from ', props);
			return;
		}

		try {
			closeTutorial();
			await playStory(props.story.id);
		} catch (error) {
			setPlayError(error as Error);
		}
	}

	async function handleCreateTemplate() {
		try {
			await createFromTemplate();
		} catch (error) {
			console.error('Error creating template:', error);
		}
	}

	return (
		<div className="route-toolbar">
			<Tabs selectedTabClassName="selected">
				<div className="route-toolbar-top">
					<BackButton />
					<TabList className="route-toolbar-tablist">
						{Object.keys(tabs).map(tabName => (
							<Tab className="route-toolbar-tab" key={tabName}>
								{tabName}
							</Tab>
						))}
					</TabList>
					<div className="route-toolbar-pinned-controls">
						{pinnedControls}
						<Tooltip title={playError?.message || ''} arrow>
							<div style={{ display: 'flex', gap: 'var(--grid-size)' }}>



								{props.story && (
									<>
										<Button
											variant="contained"
											color="inherit"
											disabled={!story}
											startIcon={<IconFileTwee />}
											onClick={handlePublishGame}
											sx={{
												textTransform: 'none',
												fontWeight: 'bold',
												boxShadow: 'none',
												'&:hover': { boxShadow: 'none' },
												padding: '6px 16px'
											}}
										>
											{t('routeActions.build.publishGame')}
										</Button>
										<Button
											variant="contained"
											color="primary"
											disabled={!props.story}
											startIcon={<IconPlayerPlay />}
											onClick={handlePlay}
											sx={{
												textTransform: 'none',
												fontWeight: 'bold',
												boxShadow: 'none',
												'&:hover': { boxShadow: 'none' }
											}}
										>
											{t('routeActions.build.play')}
										</Button>
									</>
								)}
							</div>
						</Tooltip>
						<Dialog
							open={!!playError}
							onClose={() => setPlayError(undefined)}
							aria-labelledby="alert-dialog-title"
						>
							<DialogTitle id="alert-dialog-title">
								{t('routeActions.build.playError')}
							</DialogTitle>
							<DialogContent>
								<DialogContentText>
									{playError?.message}
								</DialogContentText>
							</DialogContent>
							<DialogActions>
								<Button
									onClick={() => setPlayError(undefined)}
									color="primary"
									startIcon={<CloseIcon />}
								>
									{t('common.close')}
								</Button>
							</DialogActions>
						</Dialog>
						<Dialog
							open={!!templateError}
							onClose={clearError}
							aria-labelledby="template-error-dialog-title"
						>
							<DialogTitle id="template-error-dialog-title">
								{t('Template Error')}
							</DialogTitle>
							<DialogContent>
								<DialogContentText>
									{templateError?.message}
								</DialogContentText>
							</DialogContent>
							<DialogActions>
								<Button
									onClick={clearError}
									color="primary"
									startIcon={<CloseIcon />}
								>
									{t('common.close')}
								</Button>
							</DialogActions>
						</Dialog>
					</div>
				</div>
				<div className="route-toolbar-bottom">
					<div className="route-toolbar-align-left">
						{Object.entries(tabs).map(([tabName, tabContent]) => (
							<TabPanel key={tabName}>{tabContent}</TabPanel>
						))}
					</div>
					<div className="route-toolbar-align-right">
						<div style={{ display: 'flex', gap: 'var(--grid-size)' }}>
							<Userbox />
						</div>
					</div>
				</div>
			</Tabs>
		</div>
	);
};
