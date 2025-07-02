import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { CommandBlockBody, CommandBlockHolder } from "../command-blocks/base-ui";
import { CommandListItemContext } from "../../../components/control/passage-command-area/CommandListItemContext";
import CommandNavigators from "../../../components/control/passage-command-area/CommandNavigators";
import { useCommonTranslation, useComponentTranslation } from "../../../util/translation-wrapper";
import { 
    Box, 
    TextField, 
    Fade, 
    FormControl, 
    InputLabel,
    Slider,
    Typography,
    Autocomplete
} from "@mui/material";
import StringUtil from "../../../util/StringUtil";
import { CommandListItemContextType } from "./CommandInputTypeDefs";
import { FlexBox } from "../../template/mui-template/flex-box";
import SimpleSelect from "../../template/mui-template/simple-select";
import _ from "lodash";

// Background effect types
export enum BackgroundEffectType {
    FLASH = 'flash',
    SHAKE = 'shake',
    ZOOM_PULSE = 'zoom-pulse'
}

// Intensity options for shake effect
const SHAKE_INTENSITY_OPTIONS = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
];

// Common colors for flash effect
const FLASH_COLOR_OPTIONS = [
    { label: 'White', value: 'white' },
    { label: 'Red', value: 'red' },
    { label: 'Blue', value: 'blue' },
    { label: 'Yellow', value: 'yellow' },
    { label: 'Green', value: 'green' },
    { label: 'Black', value: 'black' }
];

// Easing options
const EASING_OPTIONS = [
    { value: 'Linear', label: 'Linear' },
    { value: 'Back.easeInOut', label: 'Back Ease' },
    { value: 'Bounce.easeOut', label: 'Bounce' },
    { value: 'Cubic.easeInOut', label: 'Cubic' },
    { value: 'Elastic.easeOut', label: 'Elastic' }
];

const genUid = (context?: CommandListItemContextType) => {
    let pid = context?.passage?.id || StringUtil.randomString();
    let cIndex = context?.commandIndex || StringUtil.randomString();
    return `BackgroundEffectCommandBlock-${pid}-${cIndex}-${StringUtil.randomString()}`;
}

export default function BackgroundEffectCommandBlock() {
    const context = React.useContext(CommandListItemContext);
    const [uid] = useState(genUid(context));

    const { tCommon } = useCommonTranslation();
    const { tComp } = useComponentTranslation('backgroundEffectCommandBlock');

    // Effect type state
    const [effectType, setEffectType] = useState<BackgroundEffectType>(
        context?.command?.content?.effectType || BackgroundEffectType.FLASH
    );

    // Flash effect states
    const [flashColor, setFlashColor] = useState<string>(
        context?.command?.content?.color || 'white'
    );
    const [flashIntensity, setFlashIntensity] = useState<number>(
        context?.command?.content?.intensity || 1.0
    );

    // Shake effect state
    const [shakeIntensity, setShakeIntensity] = useState<string>(
        context?.command?.content?.shakeIntensity || 'medium'
    );

    // Zoom pulse effect states
    const [zoomScale, setZoomScale] = useState<number>(
        context?.command?.content?.scale || 1.1
    );

    // Common states
    const [duration, setDuration] = useState<number>(
        context?.command?.content?.duration || 0.5
    );
    const [easing, setEasing] = useState<string>(
        context?.command?.content?.easing || 'Linear'
    );

    const saveCommand = () => {
        if (!context?.command || !context.editWholeCommand) return;
        context.editWholeCommand({...context.command});
    }

    // Debounced save command to prevent excessive updates during slider drag
    const debouncedSaveCommand = useCallback(
        _.debounce(() => {
            saveCommand();
        }, 100), // 100ms delay
        [context?.command, context?.editWholeCommand]
    );

    // Update command content without immediate save (for sliders)
    const updateCommandContent = (updates: any) => {
        if (!context?.command) return;
        
        context.command.content = {
            ...context.command.content || {},
            ...updates,
        };
    };

    // Regular handlers for non-slider inputs (immediate save)
    const handleEffectTypeChange = (ev, newEffectType) => {
        if (!context?.command) return;

        setEffectType(newEffectType);
        
        updateCommandContent({ effectType: newEffectType });
        saveCommand(); // Immediate save for non-slider inputs
    };

    const handleFlashColorChange = (ev, newValue) => {
        if (!context?.command) return;

        const colorValue = typeof newValue === 'string' ? newValue : newValue?.value || 'white';
        setFlashColor(colorValue);
        
        updateCommandContent({ color: colorValue });
        saveCommand(); // Immediate save for non-slider inputs
    };

    // Handle flash intensity change with debounce
    const handleFlashIntensityChange = (ev, newValue) => {
        if (!context?.command) return;

        // Update UI state immediately
        setFlashIntensity(newValue);
        
        // Update command content immediately but save with debounce
        updateCommandContent({ intensity: newValue });
        debouncedSaveCommand();
    };

    const handleShakeIntensityChange = (ev, newValue) => {
        if (!context?.command) return;

        setShakeIntensity(newValue);
        
        updateCommandContent({ intensity: newValue });
        saveCommand(); // Immediate save for non-slider inputs
    };

    const handleDurationChange = (ev) => {
        if (!context?.command) return;

        const newValue = parseFloat(ev.target.value) || 0.5;
        setDuration(newValue);
        
        updateCommandContent({ duration: newValue });
        saveCommand(); // Immediate save for non-slider inputs
    };

    const handleEasingChange = (ev, newValue) => {
        if (!context?.command) return;

        setEasing(newValue);
        
        updateCommandContent({ easing: newValue });
        saveCommand(); // Immediate save for non-slider inputs
    };

    // Handle zoom scale change with debounce
    const handleZoomScaleChange = (ev) => {
        if (!context?.command) return;

        const newValue = parseFloat(ev.target.value) || 1.1;
        // Update UI state immediately
        setZoomScale(newValue);
        
        // Update command content immediately but save with debounce
        updateCommandContent({ scale: newValue });
        debouncedSaveCommand();
    };

    // Initialize command content with all default values on mount
    const initializeDefaultValues = () => {
        if (!context?.command) return;

        const currentContent = context.command.content || {};
        const needsInit = !currentContent.effectType;

        if (needsInit) {
            // Set all default values at once
            const defaultContent = {
                effectType: BackgroundEffectType.FLASH,
                duration: 0.5,
                easing: 'Linear',
                // Flash defaults
                color: 'white',
                intensity: 1.0,
                // Zoom pulse defaults  
                scale: 1.1,
                shakeIntensity: 'medium'
            };

            context.command.content = {
                ...currentContent,
                ...defaultContent
            };
            
            // Update UI states to match defaults
            setEffectType(defaultContent.effectType);
            setDuration(defaultContent.duration);
            setEasing(defaultContent.easing);
            setFlashColor(defaultContent.color);
            setFlashIntensity(defaultContent.intensity);
            setShakeIntensity(defaultContent.shakeIntensity); // Default for shake
            setZoomScale(defaultContent.scale);
            
            saveCommand();
        }
    };

    // Initialize command content on mount
    useEffect(() => {
        initializeDefaultValues();
    }, []);

    // Cleanup debounced function on unmount
    useEffect(() => {
        return () => {
            debouncedSaveCommand.cancel();
        };
    }, [debouncedSaveCommand]);

    return (
        <CommandBlockHolder commandType={context?.command?.type}>
            <CommandNavigators />

            <CommandBlockBody>
                <FlexBox sx={{ width: '100%' }}>
                    {/* Effect Type Selector */}
                    <Box sx={{ width: '40%', mr: 2 }}>
                        <SimpleSelect
                            label="Effect Type"
                            value={effectType}
                            options={Object.values(BackgroundEffectType)}
                            getDisplayName={n => n.charAt(0).toUpperCase() + n.slice(1).replace('-', ' ')}
                            onChange={handleEffectTypeChange}
                        />
                    </Box>

                    {/* Duration Input */}
                    <Box sx={{ width: '30%', mr: 2 }}>
                        <TextField
                            label="Duration (seconds)"
                            type="number"
                            value={duration}
                            onChange={handleDurationChange}
                            inputProps={{ min: 0.1, max: 10, step: 0.1 }}
                            size="small"
                            fullWidth
                        />
                    </Box>

                    {/* Easing Selector */}
                    <Box sx={{ width: '30%' }}>
                        <SimpleSelect
                            label="Easing"
                            value={easing}
                            options={EASING_OPTIONS.map(opt => opt.value)}
                            getDisplayName={n => EASING_OPTIONS.find(opt => opt.value === n)?.label || n}
                            onChange={handleEasingChange}
                        />
                    </Box>
                </FlexBox>

                {/* Effect-specific options */}
                {effectType === BackgroundEffectType.FLASH && (
                    <Fade in={true} timeout={500}>
                        <FlexBox sx={{ width: '100%', mt: 2 }}>
                            {/* Flash Color */}
                            <Box sx={{ width: '50%', mr: 2 }}>
                                <Autocomplete
                                    freeSolo
                                    options={FLASH_COLOR_OPTIONS}
                                    value={FLASH_COLOR_OPTIONS.find(opt => opt.value === flashColor) || { label: flashColor, value: flashColor }}
                                    onChange={handleFlashColorChange}
                                    renderInput={(params) => 
                                        <TextField 
                                            {...params} 
                                            label={tComp('flashColor')} 
                                            size="small"
                                            onChange={(ev) => handleFlashColorChange(ev, ev.target.value)}
                                        />
                                    }
                                    sx={{ backgroundColor: 'white' }}
                                />
                            </Box>

                            {/* Flash Intensity */}
                            <Box sx={{ width: '50%' }}>
                                <Typography gutterBottom>
                                    {tComp('flashIntensity')}: {flashIntensity.toFixed(2)}
                                </Typography>
                                <Slider
                                    value={flashIntensity}
                                    onChange={handleFlashIntensityChange}
                                    min={0}
                                    max={1}
                                    step={0.01}
                                    valueLabelDisplay="auto"
                                    sx={{ mt: 1 }}
                                />
                            </Box>
                        </FlexBox>
                    </Fade>
                )}

                {effectType === BackgroundEffectType.SHAKE && (
                    <Fade in={true} timeout={500}>
                        <FlexBox sx={{ width: '100%', mt: 2 }}>
                            {/* Shake Intensity */}
                            <Box sx={{ width: '100%' }}>
                                <SimpleSelect
                                    label={tComp('shakeIntensity')}
                                    value={shakeIntensity}
                                    options={SHAKE_INTENSITY_OPTIONS.map(opt => opt.value)}
                                    getDisplayName={n => SHAKE_INTENSITY_OPTIONS.find(opt => opt.value === n)?.label || n}
                                    onChange={handleShakeIntensityChange}
                                />
                            </Box>
                        </FlexBox>
                    </Fade>
                )}

                {effectType === BackgroundEffectType.ZOOM_PULSE && (
                    <Fade in={true} timeout={500}>
                        <FlexBox sx={{ width: '100%', mt: 2 }}>
                            {/* Zoom Scale */}
                            <Box sx={{ width: '100%' }}>
                                <TextField
                                    label={tComp('zoomScale')}
                                    type="number"
                                    value={zoomScale}
                                    onChange={handleZoomScaleChange}
                                    inputProps={{ 
                                        min: 1.0, 
                                        max: 3.0, 
                                        step: 0.1 
                                    }}
                                    size="small"
                                    fullWidth
                                    // helperText={`Current: ${zoomScale.toFixed(2)}x`}
                                />
                            </Box>
                        </FlexBox>
                    </Fade>
                )}
            </CommandBlockBody>
        </CommandBlockHolder>
    );
} 