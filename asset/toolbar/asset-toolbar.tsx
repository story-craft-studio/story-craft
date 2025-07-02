import {IconAward, IconBug, IconFileCode, IconSettings} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {useLocation} from 'react-router-dom';
import {ButtonBar} from '../../components/container/button-bar';
import {IconButton} from '../../components/control/icon-button';
import {useDialogsContext} from '../../dialogs';
import {ImportAssetDialog} from "./import-asset-dialog";

export const AssetToolbar: React.FC = () => {
	const {dispatch} = useDialogsContext();
	const {t} = useTranslation();

	return (
		<ButtonBar>
			<IconButton
				icon={<IconSettings />}
				label={t('routeActions.asset.import')}
				onClick={() => dispatch({type: 'addDialog', component: ImportAssetDialog, centerScreen: true})}
			/>
		</ButtonBar>
	);
};
