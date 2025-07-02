import {useTranslation} from 'react-i18next';
import {isElectronRenderer} from '../util/is-electron';
import {StoryNameExistsError} from './stories/stories-errors';

export function useStoreErrorReporter() {
	// We can't use suspense here because we're too high in the component tree--we
	// need to report errors as soon as possible, and if prefs fail, we might not
	// have i18n initialized.

	const {t, ready} = useTranslation('', {useSuspense: false});

	    return {
        reportError(error: Error, messageKey: string) {
            console.error('Twine store error', error);

            if (ready) {
                // Handle specific error types with custom messages
                if (error instanceof StoryNameExistsError) {
                    const storyName = error.message.match(/'([^']+)'/)?.[1] || 'Unknown';
                    window.alert(
                        t('errorMessage.storyNameExists', {name: storyName})
                    );
                    return;
                }

                window.alert(
                    t(messageKey, {error: error.message}) +
                        ' ' +
                        t(
                            `store.errors.${
                                isElectronRenderer() ? 'electron' : 'web'
                            }Remediation`
                        )
                );
            } else {
                window.alert(
                    `An error occurred while saving (${error.message}). Reloading or restarting the application may help.`
                );
            }
        }
    };
}
