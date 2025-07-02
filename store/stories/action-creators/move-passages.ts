import {Passage, Story, UpdatePassagesAction} from '../stories.types';
import {passageDefaults} from '../defaults';

/**
 * Moves passages by an offset, e.g. after dragging.
 */
export function movePassages(
	story: Story,
	passageIds: string[],
	xChange: number,
	yChange: number
): UpdatePassagesAction {
	const passageUpdates: Record<string, Partial<Passage>> = {};

	if (!Number.isFinite(xChange) || !Number.isFinite(yChange)) {
		throw new Error('Offset must be a finite number.');
	}

	// Use the default passage size for grid snapping
	const gridSize = passageDefaults().width; // 100px - full passage card size

	passageIds.forEach(passageId => {
		const passage = story.passages.find(p => p.id === passageId);

		if (!passage) {
			throw new Error(
				`There is no passage in this story with ID "${passageId}".`
			);
		}

		let left = Math.max(passage.left + xChange, 0);
		let top = Math.max(passage.top + yChange, 0);

		if (story.snapToGrid) {
			left = Math.round(left / gridSize) * gridSize;
			top = Math.round(top / gridSize) * gridSize;
		}

		passageUpdates[passage.id] = {left, top};
	});

	return {type: 'updatePassages', passageUpdates, storyId: story.id};
}
