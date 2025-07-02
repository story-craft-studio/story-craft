import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CircularProgress, Button } from '@mui/material';
import CreateIcon from '@mui/icons-material/Create';
import { useStoryTemplate } from '../../../store/use-story-template';
import './template-card.css';
import { useDialogsContext } from '../../../dialogs';
import { CreateStoryModal } from '../../../dialogs/create-story-modal';
import { images } from '../../../components/image';

export const TemplateCard: React.FC = () => {
	const { t } = useTranslation();
	const { createFromTemplate, isCreating } = useStoryTemplate();
	const { dispatch: dialogsDispatch } = useDialogsContext();

	React.useEffect(() => {
		document.documentElement.style.setProperty('--card-bg-image', `url("${images.cardBgCss}")`);
	}, []);

	const handleCreateTemplate = async () => {
		try {
			await createFromTemplate();
		} catch (error) {
			console.error('Error creating template:', error);
		}
	};

	const openCreateStoryModal = () => {
		dialogsDispatch({
			type: 'addDialog',
			component: CreateStoryModal,
			props: {},
			centerScreen: true
		});
	};

	return (
		<div className="create-story-button-container">
			<div 
				className="create-story-button-gradient"
				onClick={openCreateStoryModal}
			>
				<div className="create-story-button-inner">
					<div className="create-story-icon">
						<CreateIcon />
					</div>
					<span className="create-story-text">
						{t('common.createStory')}
					</span>
					{isCreating && (
						<div className="create-story-loading">
							<CircularProgress size={20} color="inherit" />
						</div>
					)}
				</div>
			</div>
		</div>
	);
}; 