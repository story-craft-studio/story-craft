import {IconArrowLeft} from '@tabler/icons';
import * as React from 'react';
import {useTranslation} from 'react-i18next';
import {useLocation, useNavigate} from 'react-router-dom';
import {IconButton} from '../control/icon-button';

export const BackButton: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const {t} = useTranslation();

	if (['/', '/stories'].includes(location.pathname)) {
		return null;
	}

	return (
		<IconButton
			icon={<IconArrowLeft />}
			variant="primary"
			label={
				history.length > 1
					? t('common.back')
					: t('routes.storyList.titleGeneric')
			}
			onClick={() =>
				history.length > 1 ? navigate(-1) : navigate('/')
			}
		/>
	);
};
