import React from "react";
import { useEffect, useState } from "react";
import { CommandType } from "../PassageCommandTypeDef";
import { CommandListItemContext } from "../../../components/control/passage-command-area/CommandListItemContext";
import { CommandBlockBody, CommandBlockHolder, CommandBlockTitle } from "../command-blocks/base-ui";
import { getCommandTypeIcon } from "../command-blocks/command-type-icons";
import CommandNavigators from "../../../components/control/passage-command-area/CommandNavigators";
import { useComponentTranslation } from "../../../util/translation-wrapper";
import { FlexBox } from "../../template/mui-template/flex-box";
import { FormControl, FormControlLabel, Switch, Typography, Box } from "@mui/material";
import SoundUrlInput from "../command-blocks/sound-url-input";

export default function MusicCommandBlock() {
    const context = React.useContext(CommandListItemContext);
    if (!context) return null;

    const { t } = useComponentTranslation('musicCommandBlock');

    // Parse the command text as JSON or use default structure
    const parseCommandData = (text: string) => {
        try {
            if (!text) return { audioUrl: '', isBackgroundMusic: true };
            // Parse as JSON
            const parsed = JSON.parse(text);
            return {
                audioUrl: parsed.audioUrl || '',
                isBackgroundMusic: parsed.isBackgroundMusic !== undefined ? parsed.isBackgroundMusic : true
            };
        } catch {
            return { audioUrl: text || '', isBackgroundMusic: true };
        }
    };

    const [commandData, setCommandData] = useState(parseCommandData(context?.commandText || ''));

    useEffect(() => {
        setCommandData(parseCommandData(context?.commandText || ''));
    }, [context?.commandText]);

    const updateCommandText = (newData: { audioUrl: string; isBackgroundMusic: boolean }) => {
        const jsonString = JSON.stringify(newData);
        setCommandData(newData);
        context?._onChangeText(jsonString);
    };

    const handleAudioUrlChange = (url: string) => {
        updateCommandText({ ...commandData, audioUrl: url });
    };

    const handleBackgroundMusicToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
        updateCommandText({ ...commandData, isBackgroundMusic: event.target.checked });
    };

    return (
        <CommandBlockHolder commandType={CommandType.playMusic}>
            <CommandBlockTitle commandType={CommandType.playMusic}>
                {getCommandTypeIcon(CommandType.playMusic)}
            </CommandBlockTitle>
            <CommandNavigators />
            <CommandBlockBody>
                <FlexBox sx={{ flexDirection: 'column' }}>
                    <SoundUrlInput
                        title={commandData.isBackgroundMusic ? (t('musicUrl') || 'Music URL') : (t('soundUrl') || 'Sound URL')}
                        value={commandData.audioUrl}
                        onChange={handleAudioUrlChange}
                        placeholder={commandData.isBackgroundMusic ? (t('enterMusicURL') || 'Enter music URL') : (t('enterSoundURL') || 'Enter sound URL')}
                    />
                    
                    {/* Toggle Button Music/Sound */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: '-15px'}}> 
                        <FormControl component="fieldset">
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={commandData.isBackgroundMusic}
                                        onChange={handleBackgroundMusicToggle}
                                        color="primary"
                                    />
                                }
                                label={
                                    <Typography variant="body2">
                                        {commandData.isBackgroundMusic
                                            ? t('backgroundMusic') || 'Background Music'
                                            : t('soundEffect') || 'Sound Effect'
                                        }
                                    </Typography>
                                }
                            />
                        </FormControl>
                        <Typography variant="caption" color="textSecondary">
                            {commandData.isBackgroundMusic
                                ? t('backgroundMusicDesc') || '(Plays continuously in the background)'
                                : t('soundEffectDesc') || '(Plays once when triggered)'
                            }
                        </Typography>
                    </Box>


                </FlexBox>
            </CommandBlockBody>
        </CommandBlockHolder>
    );
} 