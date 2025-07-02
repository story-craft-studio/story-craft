import * as React from 'react';
import {useEffect, useState} from 'react';
import {Box, Button, Typography, Divider, Chip} from '@mui/material';
import {useTranslation} from 'react-i18next';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import PresetItem from './preset-item';
import {
	TwineSettingGroupCardContent,
	TwineSettingFormGroup
} from '../settings/TwineSettingsMuiTemplate';
import {usePresetSettings} from './preset-settings-context';

interface PresetListProps {
	maxHeight?: number | string;
	storyId?: string;
}

export function PresetList(props: PresetListProps) {
	const {maxHeight = 220, storyId} = props;
	const {t} = useTranslation();
	const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
	const {
        isLoading,
        userPresets, 
        recommendedPresets,
        loadUserPresets, 
        loadRecommendedPresets,
        showUploadModal,
        setShowUploadModal,
    } = usePresetSettings();

    useEffect(() => {
        refreshPresets();
    }, [])

    const refreshPresets = async () => {
        try {
            await loadRecommendedPresets();
            await loadUserPresets();
        } catch (error) {
            console.error('Error refreshing presets:', error);
        }
    }

    const handleSeeMore = async () => {
        try {
            await loadUserPresets();
        } catch (error) {
            console.error('Error loading more presets:', error);
        }
    }

    const renderTitle = () => (
        <Box sx={{display: 'flex', alignItems: 'flex-start', mb: 1, justifyContent: 'space-between'}}>
            <Box sx={{display: 'flex', flexDirection: 'column'}}>
                <Typography sx={{fontSize: 22}}>
                    {t('dialogs.presets.availablePresets')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{mt: 0.5, fontSize: '0.85rem'}}>
                    {t('dialogs.presets.description')}
                </Typography>
            </Box>
            <Button
                size="small"
                endIcon={<KeyboardArrowRightIcon />}
                onClick={handleSeeMore}
                sx={{fontSize: '0.75rem', textTransform: 'none', fontWeight: 'medium', mt: 0.5, '&:hover': {backgroundColor: 'rgba(0, 0, 0, 0.04)'}}}
            >
                {t('dialogs.presets.seeMore')}
            </Button>
        </Box>
    );

    if (isLoading) {
        return (
            <TwineSettingGroupCardContent sx={{bgcolor: 'white', maxHeight: maxHeight}}>
                {renderTitle()}
                <Divider sx={{mb: '15px'}}/>
                <Box sx={{height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Typography variant="body2">{t('dialogs.presets.loading')}</Typography>
                </Box>
            </TwineSettingGroupCardContent>
        )
    }

    if (userPresets.length === 0 && recommendedPresets.length === 0) {
        return (
            <TwineSettingGroupCardContent sx={{bgcolor: 'white', maxHeight: maxHeight}}>
                {renderTitle()}
                <Divider sx={{mb: '15px'}}/>
                <Box sx={{height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Typography variant="body2">{t('dialogs.presets.noPresets')}</Typography>
                </Box>
            </TwineSettingGroupCardContent>
        )
    }

    return (
        <TwineSettingGroupCardContent sx={{maxHeight: maxHeight}}>
            {renderTitle()}
            <Divider sx={{mb: '10px'}}/>

            <TwineSettingFormGroup className="PresetListFormGroup">
                <Box 
                    sx={{
                        position: 'relative',
                        overflow: 'hidden',
                        mb: 1
                    }}
                >
                    <Box 
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: 1.5,
                            overflowX: 'auto',
                            pb: 1,
                            '&::-webkit-scrollbar': {
                                height: 6,
                            },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: 'rgba(0,0,0,0.15)',
                                borderRadius: 4,
                            },
                            '&::-webkit-scrollbar-track': {
                                backgroundColor: 'rgba(0,0,0,0.05)',
                                borderRadius: 4,
                            }
                        }}  
                    >
                        {(() => {
                            const uniquePresets = new Map();
                            
                            recommendedPresets.forEach(preset => {
                                if (preset.id) {
                                    uniquePresets.set(preset.id, preset);
                                }
                            });
                            
                            userPresets.forEach(preset => {
                                if (preset.id && !uniquePresets.has(preset.id)) {
                                    uniquePresets.set(preset.id, preset);
                                }
                            });
                            
                            const presets = Array.from(uniquePresets.values());
                            
                            return presets.map((preset) => (
                                <Box key={preset.id} sx={{flex: '0 0 auto', width: 180, height: 100, transition: 'transform 0.2s', '&:hover': {transform: 'translateY(-3px)'}}}>
                                    <PresetItem
                                        preset={preset}
                                        viewMode={viewMode}
                                        buttonStyle="horizontal"
                                        viewIconOnly={true}
                                        storyId={storyId}
                                    />
                                </Box>
                            ));
                        })()}
                    </Box>

                    {/* Fade effect on right */}
                    <Box 
                        sx={{
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            bottom: 0,
                            width: 30,
                            background: 'linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,1))',
                            pointerEvents: 'none',
                            zIndex: 2
                        }}
                    />  
                </Box>
            </TwineSettingFormGroup>
        </TwineSettingGroupCardContent>
    );
}
