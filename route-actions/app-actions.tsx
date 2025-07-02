import {IconAward, IconBug, IconFileCode, IconSettings} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {useLocation} from 'react-router-dom';
import {ButtonBar} from '../components/container/button-bar';
import {IconButton} from '../components/control/icon-button';
import {AboutTwineDialog, AppPrefsDialog, useDialogsContext} from '../dialogs';
import {StoryFormatsDialog} from '../dialogs/story-formats/story-formats';

export const AppActions: React.FC = () => {
	const {dispatch} = useDialogsContext();
	let location = useLocation();
	const {t} = useTranslation();

	return (
		<ButtonBar>
			<IconButton
				icon={<IconSettings />}
				label={t('routeActions.app.preferences')}
				onClick={() => dispatch({type: 'addDialog', component: AppPrefsDialog})}
			/>
			<IconButton
				disabled={location.pathname === '/story-formats'}
				icon={<IconFileCode />}
				label={t('routeActions.app.storyFormats')}
				onClick={() =>
					dispatch({type: 'addDialog', component: StoryFormatsDialog})
				}
			/>
			<IconButton
				icon={<IconAward />}
				label={t('routeActions.app.aboutApp')}
				onClick={() =>
					dispatch({type: 'addDialog', component: AboutTwineDialog})
				}
			/>
			<IconButton
				icon={<IconBug />}
				label={t('routeActions.app.reportBug')}
				onClick={() => window.open('https://twinery.org/2bugs', '_blank')}
			/>
		</ButtonBar>
	);
};
