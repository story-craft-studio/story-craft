import escapeRegExp from 'lodash/escapeRegExp';
import {Thunk} from 'react-hook-thunk-reducer';
import {storyWithId} from '../getters';
import {Passage, StoriesAction, StoriesState, Story} from '../stories.types';
import {createNewlyLinkedPassages} from './create-newly-linked-passages';
import {deleteOrphanedPassages} from './delete-orphaned-passages';
import {PassageCommand} from "../../../common/passage-command/PassageCommandTypeDef";

export interface UpdatePassageOptions {
	dontUpdateOthers?: boolean;
}

/**
 * General update of a passage.
 */
export function updatePassageCommand(story: Story,
                                     passage: Passage,
                                     commandIndex: number,
                                     newCommand: PassageCommand): Thunk<StoriesState, StoriesAction> {
	let newP = {...passage};

	newP.commands[commandIndex] = newCommand;
	newP.commands = [...newP.commands];

	return updatePassage(story, passage, newP, {dontUpdateOthers: true});
}

/**
 * General update of a passage.
 */
export function updatePassage(
	story: Story,
	passage: Passage,
	props: Partial<Passage>,
	options: UpdatePassageOptions = {}
): Thunk<StoriesState, StoriesAction> {

	if (!story.passages.some(p => p.id === passage.id)) {
		throw new Error('This passage does not belong to this story.');
	}

	if (
		'name' in props &&
		story.passages
			.filter(p => p.name === props.name)
			.some(p => p.id !== passage.id)
	) {
		throw new Error(`There is already a passage named "${props.name}".`);
	}

	return (dispatch, getState) => {
		// Do the passage update itself.

		console.log('updatePassage with props', props);

		const oldName = passage.name;
		const oldCommands = passage.commands;

		dispatch({
			props,
			type: 'updatePassage',
			passageId: passage.id,
			storyId: story.id
		});

		// Side effects from changes.

		if (!options.dontUpdateOthers && props.commands) {
			dispatch(deleteOrphanedPassages(story, passage, props.commands, oldCommands));

			// We need to get an up-to-date version of the story so placement of new
			// passages is correct.

			const updatedStory = storyWithId(getState(), story.id);

			dispatch(
				createNewlyLinkedPassages(updatedStory, passage, props.commands, oldCommands)
			);
		};

		console.log('updatePassage done!');
	};
}
