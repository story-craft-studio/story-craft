import {archiveStory as archiveStoryAction, unarchiveStory as unarchiveStoryAction} from '../reducer/archive-story';
import {StoriesAction, Story} from '../stories.types';

export function archiveStory(story: Story): StoriesAction {
    return archiveStoryAction(story.id);
}

export function unarchiveStory(story: Story): StoriesAction {
    return unarchiveStoryAction(story.id);
} 