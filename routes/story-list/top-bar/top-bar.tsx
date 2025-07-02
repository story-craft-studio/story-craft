import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { IconBrandDiscord } from '@tabler/icons';
import { CircularProgress } from '@mui/material';
import CreateIcon from '@mui/icons-material/Create';
import { useStoryTemplate } from '../../../store/use-story-template';
import { useDialogsContext } from '../../../dialogs';
import { CreateStoryModal } from '../../../dialogs/create-story-modal';
import { EXTERNAL_LINKS } from '../../../common/constants';
import { images } from '../../../components/image';
import './top-bar.css';

export const TopBar: React.FC = () => {
    const { t } = useTranslation();
    const { createFromTemplate, isCreating } = useStoryTemplate();
    const { dispatch: dialogsDispatch } = useDialogsContext();

    const handleDiscordClick = () => {
        // Open Discord link in new tab
        window.open(EXTERNAL_LINKS.DISCORD, '_blank');
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
        <div className="top-bar">
            <div className="top-bar-left">
                <img
                    src={images.tutorialLogo}
                    alt="Story Craft Logo"
                    className="top-bar-logo"
                />
                <div
                    className="create-story-button-gradient"
                    onClick={openCreateStoryModal}
                >
                    <div className="create-story-button-inner">
                        <div className="create-story-icon">
                            <CreateIcon />
                        </div>
                        <span className="create-story-text">
                            {t('common.create')} {t('common.story')}
                        </span>
                        {isCreating && (
                            <div className="create-story-loading">
                                <CircularProgress size={20} color="inherit" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="top-bar-center">

            </div>
            <div className="top-bar-right">
                <button
                    className="discord-button"
                    onClick={handleDiscordClick}
                    aria-label={t('discord')}
                >
                    <IconBrandDiscord size={16} />
                    <span className="discord-button-text">{t('discord')}</span>
                </button>
            </div>
        </div>
    );
}; 