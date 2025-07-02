import * as React from 'react';
import { Button, Stack, SxProps, Tooltip, IconButton } from "@mui/material";
import { ActionDialogId, useDialogsContext } from "../../dialogs";
import { Story } from '../../store/stories';
import CharacterSettings from "./toolbar/settings/character-settings/character-settings";
import './toolbar-navigator.css';
import { IconSettings, IconInfoCircle, IconBrandDiscord } from "@tabler/icons";
import { DialogSettings } from "./toolbar/settings/dialog-settings/dialog-settings";
import { useTranslation } from 'react-i18next';
import { HAPPY_FACE_ICON, STAR_ICON } from '../../components/icons';
import { useSettings, SETTINGS_CONFIG } from './toolbar/settings/settings-context';
import { SettingActions } from './toolbar/settings/setting-actions';
import { useUndoableStoriesContext } from '../../store/undoable-stories';
import { useTutorial } from '../../routes/tutorial';
import { EXTERNAL_LINKS } from '../../common/constants';

interface ToolbarNavigatorProps {
    story: Story;
}

const ToolbarNavigatorContent: React.FC<ToolbarNavigatorProps> = ({ story }) => {
    const { dispatch } = useDialogsContext();
    const { showGeneralSetting, openDialogById } = useSettings();
    const { t } = useTranslation();
    const { toggleTutorial, setOnCloseCallback } = useTutorial();
    const [isShaking, setIsShaking] = React.useState(false);

    // Set up the tutorial close callback
    React.useEffect(() => {
        const handleTutorialClose = () => {
            console.log('Tutorial close callback triggered - starting shake animation');
            setIsShaking(true);
            // Remove the animation class after animation completes
            setTimeout(() => {
                console.log('Shake animation completed');
                setIsShaking(false);
            }, 1500); // Match the animation duration
        };

        console.log('Setting up tutorial close callback');
        setOnCloseCallback(handleTutorialClose);

        // Cleanup: remove callback when component unmounts
        return () => {
            console.log('Cleaning up tutorial close callback');
            setOnCloseCallback(null);
        };
    }, [setOnCloseCallback]);

    const handleCharacterButtonClick = (event: React.MouseEvent) => {
        event.stopPropagation(); // Prevent event from bubbling
        console.log("Touch character");

        // Close any existing character settings dialog
        dispatch({
            type: 'removeDialogById',
            id: 'CharacterSettings' as ActionDialogId,
        });

        // Open the character settings dialog
        dispatch({
            type: 'addDialog',
            component: CharacterSettings,
            id: 'CharacterSettings' as ActionDialogId,
            props: { storyId: story.id }
        });
    };

    const handleSettingsButtonClick = (event: React.MouseEvent) => {
        event.stopPropagation(); // Prevent event from bubbling
        console.log("Opening general settings");

        // Show general settings and open the first dialog
        showGeneralSetting();

        // Open the first dialog from settings config
        if (SETTINGS_CONFIG.length > 0) {
            openDialogById(SETTINGS_CONFIG[0].id, { storyId: story.id });
        }
    };

    const handleDiscordButtonClick = (event: React.MouseEvent) => {
        event.stopPropagation(); // Prevent event from bubbling
        window.open(EXTERNAL_LINKS.DISCORD, '_blank');
    };

    const buttonStyle: SxProps = {
        backgroundColor: '#4fff89',
        color: '#2b2b2b',
        borderRadius: '8px',
        '&:hover': {
            backgroundColor: '#e5ff70',
            transform: 'translateY(-2px)',
            transition: 'all 0.2s ease-in-out',
        },
        boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
        padding: '10px 10px',
        fontWeight: 'bold',
        transition: 'all 0.2s ease-in-out',
        marginBottom: '10px',
        pointerEvents: 'auto', // Ensure pointer events are enabled
        textAlign: 'center',
        '& .MuiButton-startIcon': {
            marginRight: 'auto',  // Push the text to the right
            marginLeft: 0,
        }
    };

    const tutorialButtonStyle: SxProps = {
        backgroundColor: '#4f9fff',
        color: '#ffffff',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        '&:hover': {
            backgroundColor: '#70c0ff',
            transform: 'scale(1.1)',
            transition: 'all 0.2s ease-in-out',
        },
        boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
        transition: 'all 0.2s ease-in-out',
        marginBottom: '20px',
        pointerEvents: 'auto',
    };

    const discordButtonStyle: SxProps = {
        backgroundColor: '#5865F2',
        color: '#ffffff',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        '&:hover': {
            backgroundColor: '#4752C4',
            transform: 'scale(1.1)',
            transition: 'all 0.2s ease-in-out',
        },
        boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
        transition: 'all 0.2s ease-in-out',
        marginBottom: '20px',
        marginLeft: '10px',
        pointerEvents: 'auto',
    };

    const clickableLineStyle: SxProps = {
        color: 'var(--dark-green)',
        textDecoration: 'underline',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 'normal',
        padding: '4px 0',
        '&:hover': {
            color: 'var(--green)',
            textDecoration: 'underline',
        },
        transition: 'color 0.2s ease-in-out',
        pointerEvents: 'auto',
        textAlign: 'left',
        display: 'block',
        width: '100%',
    };

    const iconStyle = {
        width: '24px',
        height: '24px',
        marginRight: '8px',
    };

    return (
        <>
            <div
                className="toolbar-navigator"
                onClick={(e) => e.stopPropagation()} // Stop propagation at the container level
            >
                <Stack spacing={1} direction="column" alignItems="flex-start" sx={{ marginBottom: '20px' }}>
                    <Button
                        variant="contained"
                        startIcon={<img src={HAPPY_FACE_ICON} alt="Happy face" style={iconStyle} />}
                        onClick={handleCharacterButtonClick}
                        sx={buttonStyle}
                    >
                        {t('components.toolbarNavigator.characters')}
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<img src={STAR_ICON} alt="Star icon" style={iconStyle} />}
                        onClick={handleSettingsButtonClick}
                        sx={buttonStyle}
                    >
                        {t('components.toolbarNavigator.gameVisual')}
                    </Button>
                </Stack>

                {/* Clickable text lines at bottom */}
                <div style={{ textAlign: 'left' }}>
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleTutorial();
                        }}
                        style={{...clickableLineStyle, display: 'flex', alignItems: 'center'}}
                        className={isShaking ? 'tutorial-button-shake-highlight' : ''}
                    >
                        <IconInfoCircle 
                            size={16} 
                            style={{ 
                                marginRight: '8px',
                                color: 'var(--dark-green)'
                            }} 
                        />
                        Simple Tutorial
                    </div>
                    <div
                        onClick={handleDiscordButtonClick}
                        style={{...clickableLineStyle, display: 'flex', alignItems: 'center'}}
                    >
                        <IconBrandDiscord 
                            size={16} 
                            style={{ 
                                marginRight: '8px',
                                color: 'var(--dark-green)'
                            }} 
                        />
                        Join our Discord to get support
                    </div>
                </div>
            </div>
        </>
    );
};

// Wrap component với SettingsProvider
export const ToolbarNavigator: React.FC<ToolbarNavigatorProps> = props => {
    return (
        <ToolbarNavigatorContent {...props} />
    );
};

export default ToolbarNavigator;