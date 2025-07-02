import {Thunk} from 'react-hook-thunk-reducer';
import {getRandomPastelColor} from '../../../util/pastel-colors';
import {StoriesAction, StoriesState, Story} from '../stories.types';

/**
 * Assigns random pastel colors to all passages in a story that don't already have colors.
 */
export function assignPassageColors(
    story: Story
): Thunk<StoriesState, StoriesAction> {
    return dispatch => {
        const updates: Record<string, {color: string}> = {};
        
        story.passages.forEach(passage => {
            if (!passage.color) {
                updates[passage.id] = {color: getRandomPastelColor()};
            }
        });

        if (Object.keys(updates).length > 0) {
            dispatch({
                type: 'updatePassages',
                storyId: story.id,
                passageUpdates: updates
            });
        }
    };
}

/**
 * Assigns a random pastel color to a specific passage.
 */
export function assignRandomColorToPassage(
    story: Story,
    passageId: string
): Thunk<StoriesState, StoriesAction> {
    return dispatch => {
        dispatch({
            type: 'updatePassage',
            storyId: story.id,
            passageId: passageId,
            props: {color: getRandomPastelColor()}
        });
    };
} 