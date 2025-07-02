import {usePublishing} from './use-publishing';
import {isElectronRenderer} from '../util/is-electron';
import {TwineElectronWindow} from '../electron/shared';
import { useDialogsContext } from '../dialogs';
import { PlayModal } from '../components/play-modal/play-modal';
import { TestModal } from '../components/test-modal/test-modal';

export interface UseStoryLaunchProps {
	playStory: (storyId: string) => Promise<void>;
	proofStory: (storyId: string) => Promise<void>;
	testStory: (storyId: string, startPassageId?: string) => Promise<void>;
}

/**
 * Provides functions to launch a story that include the correct handling for
 * both web and Electron contexts.
 */
export function useStoryLaunch(): UseStoryLaunchProps {
	const {proofStory, publishStory} = usePublishing();
	const { dispatch } = useDialogsContext();

	if (isElectronRenderer()) {
		const {twineElectron} = window as TwineElectronWindow;

		if (!twineElectron) {
			throw new Error('Electron bridge is not present on window.');
		}

		// These are async to match the type in the browser context.

		return {
			playStory: async storyId => {
				twineElectron.openWithScratchFile(
					await publishStory(storyId, {useDebug: false}),
					`play-${storyId}.html`
				);
			},
			proofStory: async storyId => {
				twineElectron.openWithScratchFile(
					await proofStory(storyId),
					`proof-${storyId}.html`
				);
			},
			testStory: async (storyId, startPassageId) => {
				twineElectron.openWithScratchFile(
					await publishStory(storyId, {
						formatOptions: 'debug',
						startId: startPassageId
					}),
					`test-${storyId}.html`
				);
			}
		};
	}

	return {
		playStory: async storyId => {
			dispatch({
				type: 'addDialog',
				component: PlayModal,
				props: {
					storyId,
					open: true,
					onClose: () => {
						dispatch({ type: 'removeDialog', index: 0 });
					}
				}
			});
		},
		proofStory: async storyId => {
			window.open(`#/stories/${storyId}/proof`, '_blank');
		},
		testStory: async (storyId, startPassageId) => {
			dispatch({
				type: 'addDialog',
				component: TestModal,
				props: {
					storyId,
					startPassageId,
					open: true,
					onClose: () => {
						dispatch({ type: 'removeDialog', index: 0 });
					}
				}
			});
		}
	};
}
