import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { CircularProgress, TextField, IconButton, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PublishIcon from '@mui/icons-material/Publish';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useDialogsContext } from '../../../dialogs';
import { useStoryLaunch } from '../../../store/use-story-launch';
import { PublishGamePopup } from '../../../util/publish/publish-game-popup';
import { Story, createUntitledPassage } from '../../../store/stories';
import { useUndoableStoriesContext } from '../../../store/undoable-stories';
import { Point } from '../../../util/geometry';
import { useComputedTheme } from '../../../store/prefs/use-computed-theme';
import { setPref, usePrefsContext } from '../../../store/prefs';
import { DefaultService } from '../../../_genApi/static-asset/services/DefaultService';
import { VersionStatus } from '../../../_genApi/static-asset/models/VersionStatus';
import { syncAndGetGameId } from '../../../util/publish';
import { images } from '../../../components/image';
import './story-edit-top-bar.css';

interface StoryEditTopBarProps {
    story: Story;
    getCenter: () => Point;
}

export const StoryEditTopBar: React.FC<StoryEditTopBarProps> = ({ story, getCenter }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { dispatch: dialogsDispatch, dialogs } = useDialogsContext();
    const { dispatch: storiesDispatch } = useUndoableStoriesContext();
    const { playStory } = useStoryLaunch();
    const { dispatch: prefDispatch, prefs } = usePrefsContext();
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [isPublishing, setIsPublishing] = React.useState(false);
    const [isEditingTitle, setIsEditingTitle] = React.useState(false);
    const [editedTitle, setEditedTitle] = React.useState(story.name);
    const [mode, setMode] = React.useState(useComputedTheme());
    const [gameStatus, setGameStatus] = React.useState<VersionStatus | null>(null);
    const [isLoadingStatus, setIsLoadingStatus] = React.useState(false);

    const handleCreatePassage = React.useCallback(() => {
        const { left, top } = getCenter();
        storiesDispatch(createUntitledPassage(story, left, top), 'undoChange.newPassage');
    }, [storiesDispatch, getCenter, story]);

    const handleLogoClick = () => {
        navigate('/');
    };

    const handlePlay = async () => {
        setIsPlaying(true);
        try {
            await playStory(story.id);
        } catch (error) {
            console.error('Error playing story:', error);
        } finally {
            setIsPlaying(false);
        }
    };

    // Lấy trạng thái game
    const fetchGameStatus = React.useCallback(async () => {
        if (!story?.id) return;
        
        setIsLoadingStatus(true);
        try {
            const gameInfo = await syncAndGetGameId(story.id);
            if (gameInfo?.gameId) {
                const response = await DefaultService.postApiMyGameVersions({
                    gameId: gameInfo.gameId,
                    maxVersionId: undefined,
                    numTake: 1
                });
                if (response && response.length > 0) {
                    setGameStatus(response[0].status);
                } else {
                    setGameStatus(null);
                }
            } else {
                setGameStatus(null);
            }
        } catch (error) {
            console.error('Error fetching game status:', error);
            setGameStatus(null);
        } finally {
            setIsLoadingStatus(false);
        }
    }, [story?.id]);

    // Cập nhật trạng thái game khi component mount hoặc sau khi dialog đóng
    React.useEffect(() => {
        fetchGameStatus();
    }, [fetchGameStatus]);

    const handlePublish = () => {
        setIsPublishing(true);
        dialogsDispatch({
            type: 'addDialog',
            component: PublishGamePopup,
            props: {
                story,
                onClose: () => {
                    dialogsDispatch({ type: 'removeDialog', index: 0 });
                    setIsPublishing(false);
                    // Cập nhật lại trạng thái game sau khi đóng dialog
                    fetchGameStatus();
                }
            },
            centerScreen: true
        });
    };

    const handleTitleEdit = () => {
        setIsEditingTitle(true);
        setEditedTitle(story.name);
    };

    const handleTitleSave = () => {
        if (editedTitle.trim() && editedTitle !== story.name) {
            storiesDispatch({
                type: 'updateStory',
                storyId: story.id,
                props: { name: editedTitle.trim() }
            }, 'undoChange.renameStory');
        }
        setIsEditingTitle(false);
    };

    const handleTitleCancel = () => {
        setEditedTitle(story.name);
        setIsEditingTitle(false);
    };

    const handleTitleKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleTitleSave();
        } else if (event.key === 'Escape') {
            handleTitleCancel();
        }
    };

    const toggleMode = () => {
        const newMode = mode === 'light' ? 'dark' : 'light';
        setMode(newMode);
        prefDispatch(setPref('appTheme', newMode));
        prefs.appTheme = newMode;
    };

    const truncateTitle = (title: string, maxLength: number = 25): string => {
        if (title.length <= maxLength) {
            return title;
        }
        return title.substring(0, maxLength) + '...';
    };

    // Reset publishing state when publish dialog is no longer in the dialogs array
    React.useEffect(() => {
        if (isPublishing) {
            const hasPublishDialog = dialogs.activeDialogs.some(dialog => dialog.component === PublishGamePopup);
            if (!hasPublishDialog) {
                setIsPublishing(false);
                
                // Cập nhật lại trạng thái game sau khi đóng dialog
                fetchGameStatus();
            }
        }
    }, [dialogs, isPublishing]);

    const renderGameStatusBadge = () => {
        if (isLoadingStatus) {
            return (
                <div className="game-status-badge game-status-loading"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <CircularProgress size={16} />
                </div>
            );
        }

        switch (gameStatus) {
            case VersionStatus.REVIEWING:
                return (
                    <Tooltip title={t('common.reviewing')}>
                        <div className="game-status-badge game-status-reviewing">
                            <ScheduleIcon fontSize="small" />
                        </div>
                    </Tooltip>
                );
            case VersionStatus.APPROVED:
                return (
                    <Tooltip title={t('common.published')}>
                        <div className="game-status-badge game-status-approved">
                            <CheckCircleIcon fontSize="small" />
                        </div>
                    </Tooltip>
                );
            case VersionStatus.REJECTED:
                return (
                    <Tooltip title={t('common.rejected')}>
                        <div className="game-status-badge game-status-rejected">
                            <ErrorIcon fontSize="small" />
                        </div>
                    </Tooltip>
                );
            default:
                return (
                    <Tooltip title={t('common.unpublished')}>
                        <div className="game-status-badge game-status-unpublished">
                            <PublishIcon fontSize="small" />
                        </div>
                    </Tooltip>
                );
        }
    };

    return (
        <div className="story-edit-top-bar">
            <div className="story-edit-top-bar-left">
                <img 
                    src={images.tutorialLogo}
                    alt="Story Craft Logo" 
                    className="story-edit-top-bar-logo"
                    onClick={handleLogoClick}
                    style={{ cursor: 'pointer', marginRight: '16px' }}
                />
                <div 
                    className="create-passage-button-gradient"
                    onClick={handleCreatePassage}
                >
                    <div className="create-passage-button-inner">
                        <div className="create-passage-icon">
                            <AddIcon />
                        </div>
                        <span className="create-passage-text">
                            {t('common.createChapter')}
                        </span>
                    </div>
                </div>
                <IconButton
                    onClick={toggleMode}
                    className="theme-toggle-button"
                    aria-label={t('common.toggleTheme')}
                    style={{ 
                        marginLeft: '12px',
                        background: 'linear-gradient(145deg, #ffffff, #f0f4fa)',
                        border: '1px solid rgba(0, 0, 0, 0.08)',
                        borderRadius: '12px',
                        width: '44px',
                        height: '44px',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.25s ease'
                    }}
                >
                    {mode === 'dark' ? (
                        <LightModeIcon fontSize="small" style={{ color: '#ffd700' }} />
                    ) : (
                        <DarkModeIcon fontSize="small" style={{ color: '#333' }} />
                    )}
                </IconButton>
            </div>
            <div className="story-edit-top-bar-center">
                {isEditingTitle ? (
                    <div className="story-title-edit-container">
                        <TextField
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                            onKeyDown={handleTitleKeyPress}
                            variant="outlined"
                            size="small"
                            autoFocus
                            className="story-title-input"
                            inputProps={{
                                style: { textAlign: 'center' }
                            }}
                        />
                        <IconButton
                            size="small"
                            onClick={handleTitleSave}
                            className="story-title-save-button"
                            aria-label={t('common.save')}
                        >
                            <CheckIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                            size="small"
                            onClick={handleTitleCancel}
                            className="story-title-cancel-button"
                            aria-label={t('common.cancel')}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </div>
                ) : (
                    <div 
                        className="story-title-display"
                        onClick={handleTitleEdit}
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                        <span className="story-title-text">{truncateTitle(story.name)}</span>
                        <EditIcon 
                            fontSize="small" 
                            style={{ marginLeft: '8px', opacity: 0.6 }}
                        />
                    </div>
                )}
            </div>
            <div className="story-edit-top-bar-right">
                <button 
                    className="play-button"
                    onClick={handlePlay}
                    disabled={isPlaying}
                    aria-label={t('common.play')}
                >
                    {isPlaying ? (
                        <CircularProgress size={16} color="inherit" />
                    ) : (
                        <PlayArrowIcon fontSize="small" />
                    )}
                    <span className="play-button-text">{t('common.play')}</span>
                </button>
                <button 
                    className="publish-button"
                    onClick={handlePublish}
                    disabled={isPublishing}
                    aria-label={t('common.publishGame')}
                >
                    {isPublishing ? (
                        <CircularProgress size={16} color="inherit" />
                    ) : (
                        <PublishIcon fontSize="small" />
                    )}
                    <span className="publish-button-text">{t('common.publishGame')}</span>
                </button>
                {renderGameStatusBadge()}
            </div>
        </div>
    );
}; 