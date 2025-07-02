import orderBy from 'lodash/orderBy';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { MainContent } from '../../components/container/main-content';
import { SafariWarningCard } from '../../components/error';
import {
	AppDonationDialog,
	DialogsContextProvider,
	useDialogsContext
} from '../../dialogs';
import { usePrefsContext } from '../../store/prefs';
import { useDonationCheck } from '../../store/prefs/use-donation-check';
import {
	deselectAllStories,
	deselectStory,
	selectStory,
	unarchiveStory,
	useStoriesContext
} from '../../store/stories';
import { UndoableStoriesContextProvider } from '../../store/undoable-stories';
import { StoryListToolbar } from './toolbar/story-list-toolbar';
import { TopBar } from './top-bar/top-bar';
import { StoryCards } from './story-cards';
import { ClickAwayListener } from '../../components/click-away-listener';
import { DefaultService } from '../../_genApi/static-asset';
import { syncAndGetGameId } from '../../util/publish';
import { Paper, Typography } from '@mui/material';
import { LeftPanel } from './template-card';
import './story-list-route.css';
import { CreateStoryModal } from '../../dialogs/create-story-modal';
import { ArchiveBox, ArchivePopup } from '../../components/archive';

// Get version from Vite's environment variables
const version = process.env.VITE_APP_VERSION || '2.10.0';

const VersionText: React.FC = () => (
	<Typography 
		variant="caption" 
		style={{ 
			position: 'fixed', 
			bottom: '10px', 
			right: '10px',
			color: 'rgba(0, 0, 0, 0.5)',
			fontSize: '1rem'
		}}
	>
		Version {version}
	</Typography>
);

export const InnerStoryListRoute: React.FC = () => {
	const { dispatch: dialogsDispatch } = useDialogsContext();
	const { dispatch: storiesDispatch, stories } = useStoriesContext();
	const { prefs } = usePrefsContext();
	const { shouldShowDonationPrompt } = useDonationCheck();
	const { t } = useTranslation();
	const [archivePopupOpen, setArchivePopupOpen] = React.useState(false);

	// Add effect to open create story modal when there are no stories
	React.useEffect(() => {
		if (stories.length === 0) {
			dialogsDispatch({
				type: 'addDialog',
				component: CreateStoryModal,
				props: {
					onClose: () => {
						dialogsDispatch({ type: 'removeDialog', index: 0 });
					}
				},
				centerScreen: true
			});
		}
	}, [stories.length, dialogsDispatch]);

	const selectedStories = React.useMemo(
		() => stories.filter(story => story.selected),
		[stories]
	);

	const archivedStories = React.useMemo(
		() => stories.filter(story => story.archived),
		[stories]
	);

	const onSelectStory = async (story) => {
		storiesDispatch(selectStory(story, true));
		syncAndGetGameId(story.id);
	}

	const visibleStories = React.useMemo(() => {
		// Filter out archived stories first
		const nonArchivedStories = stories.filter(story => !story.archived);
		
		const filteredStories =
			prefs.storyListTagFilter.length > 0
				? nonArchivedStories.filter(story =>
					story.tags.some(tag => prefs.storyListTagFilter.includes(tag))
				)
				: nonArchivedStories;

		switch (prefs.storyListSort) {
			case 'date':
				return orderBy(filteredStories, ['lastUpdate'], ['desc']);
			case 'name':
				return orderBy(filteredStories, 'name');
		}
	}, [prefs.storyListSort, prefs.storyListTagFilter, stories]);

	// Any stories no longer visible should be deselected.

	React.useEffect(() => {
		for (const story of selectedStories) {
			if (story.selected && !visibleStories.includes(story)) {
				storiesDispatch(deselectStory(story));
			}
		}
	}, [selectedStories, stories, storiesDispatch, visibleStories]);

	React.useEffect(() => {
		if (false) {
			dialogsDispatch({ type: 'addDialog', component: AppDonationDialog });
		}
	}, [dialogsDispatch, shouldShowDonationPrompt]);

	const handleUnarchiveStory = (story) => {
		storiesDispatch(unarchiveStory(story));
	};

	return (
		<div className="story-list-route">
			<StoryListToolbar selectedStories={selectedStories} />
			<TopBar />
			<ClickAwayListener
				ignoreSelector=".story-card"
				onClickAway={() => storiesDispatch(deselectAllStories())}
			>
				<MainContent
					title={t(
						prefs.storyListTagFilter.length > 0
							? 'routes.storyList.taggedTitleCount'
							: 'routes.storyList.titleCount',
						{ count: visibleStories.length }
					)}
					className="story-list-main-content"
				>
					<div className="stories">
						{stories.length === 0 ? (
							<p>{t('routes.storyList.noStories')}</p>
						) : (
							<StoryCards
								onSelectStory={onSelectStory}
								stories={visibleStories}
							/>
						)}
					</div>
					<VersionText />
				</MainContent>
			</ClickAwayListener>
			
			<ArchiveBox 
				archivedCount={archivedStories.length}
				onClick={() => setArchivePopupOpen(true)}
			/>
			
			<ArchivePopup
				open={archivePopupOpen}
				onClose={() => setArchivePopupOpen(false)}
				archivedStories={archivedStories}
				onUnarchive={handleUnarchiveStory}
			/>
		</div>
	);
};

export const StoryListRoute: React.FC = () => (
	<UndoableStoriesContextProvider>
		<DialogsContextProvider>
			<InnerStoryListRoute />
		</DialogsContextProvider>
	</UndoableStoriesContextProvider>
);
