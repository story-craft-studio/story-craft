import * as React from 'react';
import {useNavigate} from 'react-router-dom';
import {CSSTransition, TransitionGroup} from 'react-transition-group';
import {CardGroup} from '../../components/container/card-group';
import {StoryCard} from '../../components/story/story-card';
import {setPref, usePrefsContext} from '../../store/prefs';
import {Story, updateStory, archiveStory, deleteStory} from '../../store/stories';
import {useUndoableStoriesContext} from '../../store/undoable-stories';
import {Color} from '../../util/color';

/**
 * How wide a story card should render onscreen as.
 */
const cardWidth = '500px';

export interface StoryCardsProps {
	onSelectStory: (story: Story) => void;
	stories: Story[];
}

export const StoryCards: React.FC<StoryCardsProps> = props => {
	const {onSelectStory, stories} = props;
	const {dispatch: prefsDispatch, prefs} = usePrefsContext();
	const {dispatch: storiesDispatch} = useUndoableStoriesContext();
	const navigate = useNavigate();
	const [loadingStoryId, setLoadingStoryId] = React.useState<string | null>(null);

	function handleChangeTagColor(tagName: string, color: Color) {
		prefsDispatch(
			setPref('storyTagColors', {
				...prefs.storyTagColors,
				[tagName]: color
			})
		);
	}

	function handleRemoveTag(story: Story, tagName: string) {
		storiesDispatch(
			updateStory(stories, story, {
				tags: story.tags.filter(tag => tag !== tagName)
			})
		);
	}

	function handleEditStory(story: Story) {
		setLoadingStoryId(story.id);
		
		// Simulate loading delay and navigate
		setTimeout(() => {
			navigate(`/stories/${story.id}`);
			// Reset loading state after navigation
			setTimeout(() => setLoadingStoryId(null), 100);
		}, 300); // Small delay to show loading effect
	}

	function handleArchiveStory(story: Story) {
		storiesDispatch(archiveStory(story));
	}

	function handleDeleteStory(story: Story) {
		storiesDispatch(deleteStory(story));
	}

	return (
		<>
			<CardGroup columnWidth={cardWidth}>
				<TransitionGroup component={null}>
					{stories.map(story => (
						<CSSTransition classNames="pop" key={story.id} timeout={200}>
							<StoryCard
								onChangeTagColor={handleChangeTagColor}
								onEdit={() => handleEditStory(story)}
								onRemoveTag={name => handleRemoveTag(story, name)}
								onSelect={() => onSelectStory(story)}
								onArchive={() => handleArchiveStory(story)}
								onDelete={() => handleDeleteStory(story)}
								story={story}
								storyTagColors={prefs.storyTagColors}
								isLoading={loadingStoryId === story.id}
							/>
						</CSSTransition>
					))}
				</TransitionGroup>
			</CardGroup>
		</>
	);
};
