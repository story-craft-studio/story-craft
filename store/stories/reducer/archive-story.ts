import {ArchiveStoryAction, UnarchiveStoryAction, Story} from '../stories.types';

export function archiveStory(storyId: string): ArchiveStoryAction {
    return {
        type: 'archiveStory',
        storyId
    };
}

export function unarchiveStory(storyId: string): UnarchiveStoryAction {
    return {
        type: 'unarchiveStory',
        storyId
    };
}

export function reduceArchiveStory(
    state: Story[],
    action: ArchiveStoryAction
): Story[] {
    return state.map(story => 
        story.id === action.storyId 
            ? { ...story, archived: true }
            : story
    );
}

export function reduceUnarchiveStory(
    state: Story[],
    action: UnarchiveStoryAction
): Story[] {
    return state.map(story => 
        story.id === action.storyId 
            ? { ...story, archived: false }
            : story
    );
} 