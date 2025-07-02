import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoriesContext } from './stories';
import { createStoryFromTemplate, STORY_TEMPLATES } from '../util/create-template';

/**
 * Custom hook for creating stories from templates
 * @returns Functions and state for creating stories from templates
 */
export function useStoryTemplate() {
	const [isCreating, setIsCreating] = useState(false);
	const [error, setError] = useState<Error | undefined>(undefined);
	const navigate = useNavigate();
	const { dispatch, stories } = useStoriesContext();

	/**
	 * Creates a story from the template and optionally navigates to it
	 * @param options Configuration options
	 * @returns The created story ID if successful
	 */
	const createFromTemplate = async (options: {
		templatePath?: string;
		navigateToStory?: boolean;
		onSuccess?: (storyId: string) => void;
	} = {}) => {
		const {
			templatePath = STORY_TEMPLATES.default,
			navigateToStory = true,
			onSuccess
		} = options;

		try {
			setIsCreating(true);
			setError(undefined);

			const existingStoryNames = stories.map(story => story.name);
			const templateStory = await createStoryFromTemplate(existingStoryNames, templatePath);

			// Create the story
			dispatch({ type: 'createStory', props: templateStory });

			// Handle navigation and success callback
			if (navigateToStory) {
				// Small delay to ensure the story is created in the store
				setTimeout(() => {
					navigate(`/stories/${templateStory.id}`);
				}, 100);
			}

			if (onSuccess) {
				onSuccess(templateStory.id);
			}

			return templateStory.id;
		} catch (err) {
			setError(err as Error);
			throw err;
		} finally {
			setIsCreating(false);
		}
	};

	const clearError = () => setError(undefined);

	return {
		createFromTemplate,
		isCreating,
		error,
		clearError
	};
} 