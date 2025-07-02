import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import {
  Box, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Typography, 
  TextField,
  RadioGroup,
  Radio,
  FormControlLabel,
  IconButton,
  Divider,
  Grid,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
  Snackbar,
  Alert,
  AlertColor
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import ImageIcon from '@mui/icons-material/Image';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CropOriginalIcon from '@mui/icons-material/CropOriginal';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import { usePresetSettings } from './preset-settings-context';
import { storyWithId, useStoriesContext } from '../../../../store/stories';
import { Preset, PresetService } from './preset-services';

// Modes in the preset upload process
enum UploadMode {
    SELECT_OPTION = 'select_option',
    ENTER_INFO = 'enter_info',
}

interface PresetUploadModalProps {
    open: boolean;
    onClose: () => void;
    storyId: string;
}

// Interface for the preset being edited
interface EditingPreset {
    id?: number;
    name: string;
    path?: string;
    thumbnailFile?: File | null;
    thumbnailPreview: string;
}

export const PresetUploadModal: React.FC<PresetUploadModalProps> = ({ open, onClose, storyId }) => {
    const { t } = useTranslation();
    const { stories } = useStoriesContext();
    const story = storyWithId(stories, storyId);
    
    // Step management
    const [currentMode, setCurrentMode] = useState<UploadMode>(UploadMode.SELECT_OPTION);
    
    // Options for step 1
    const [presetOption, setPresetOption] = useState<'new' | 'override'>('new');
    
    const [editingPreset, setEditingPreset] = useState<EditingPreset>({
        name: '',
        path: '',
        thumbnailPreview: '',
    });
    
    // UI state
    const [fitMode, setFitMode] = useState<'contain' | 'cover'>('contain');
    
    // Thông báo Snackbar
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'info' as AlertColor
    });
    
    // File input ref
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Preset context for saving
    const { 
        userPresets, 
        loadUserPresets, 
        createPreset, 
        updatePreset,
        isLoading,
        isSaving,
        error 
    } = usePresetSettings();

    // Load user's presets when modal opens
    useEffect(() => {
        if (open) {
            loadUserPresets();
        }
    }, [open]);

    // Reset state when dialog closes and reopens
    useEffect(() => {
        if (open) {
            setCurrentMode(UploadMode.SELECT_OPTION);
            setPresetOption('new');
            setEditingPreset({
                name: '',
                path: '',
                thumbnailPreview: '',
            });
            setFitMode('contain');
        }
    }, [open]);

    // Reset state when back to select option step if there is an existing preset
    useEffect(() => {
        if (currentMode === UploadMode.SELECT_OPTION) {
            if (editingPreset.id) {
                setEditingPreset({
                    id: undefined,
                    name: '',
                    path: '',
                    thumbnailPreview: '',
                });
            }
        }
    }, [currentMode]);

    // Hiển thị thông báo
    const showMessage = (message: string, severity: AlertColor = 'info') => {
        setSnackbar({
            open: true,
            message,
            severity
        });
    };

    // Đóng thông báo
    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({
            ...prev,
            open: false
        }));
    };

    // Handle preset selection for override
    const handlePresetSelect = (presetId: number) => {
        // Find the selected preset
        const selectedPreset = userPresets.find(p => p.id === presetId);
        
        if (selectedPreset) {
            // Update state with the selected preset information
            setEditingPreset({
                id: selectedPreset.id,
                name: selectedPreset.name,
                path: selectedPreset.path,
                thumbnailPreview: PresetService.getPresetThumbnailUrl(selectedPreset),
            });
        }
    };

    // Handle file selection for thumbnail
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            
            // Create a preview URL
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    const thumbnailPreview = e.target.result as string;
                    setEditingPreset(prev => ({
                        ...prev,
                        thumbnailFile: file,
                        thumbnailPreview: thumbnailPreview
                    }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle clicking the upload button
    const handleUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // Handle changing fit mode
    const handleFitModeChange = (
        event: React.MouseEvent<HTMLElement>,
        newFitMode: 'contain' | 'cover',
    ) => {
        if (newFitMode !== null) {
            setFitMode(newFitMode);
        }
    };

    // Handle moving from step 1 to step 2
    const handleNext = () => {
        // Check if override is selected but no preset is chosen
        if (presetOption === 'override' && !editingPreset.id) {
            showMessage(t('dialogs.presets.selectPresetToOverride', 'Please select a preset to override'), 'warning');
            return;
        }
        
        setCurrentMode(UploadMode.ENTER_INFO);
    };

    // Handle going back to step 1
    const handleBack = () => {
        setCurrentMode(UploadMode.SELECT_OPTION);
    };

    // Handle name change
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditingPreset(prev => ({
            ...prev,
            name: e.target.value
        }));
    };

    // Handle saving the preset
    const handleSavePreset = async () => {
        if (!editingPreset.name.trim()) {
            showMessage(t('dialogs.presets.enterPresetName', 'Please enter a preset name'), 'warning');
            return;
        }

        if (!editingPreset.thumbnailFile && presetOption === 'new' && !editingPreset.thumbnailPreview) {
            showMessage(t('dialogs.presets.selectThumbnail', 'Please select a thumbnail'), 'warning');
            return;
        }

        try {
            // Get current settings from story
            const currentSettings = {
                characterDialogSetting: story?.storySetting?.characterDialogSetting || {},
                startMenuSetting: story?.storySetting?.startMenuSetting || {},
                endMenuSetting: story?.storySetting?.endMenuSetting || {},
                choiceMenuSetting: story?.storySetting?.choiceMenuSetting || {}
            };

            // Create or update preset
            if (presetOption === 'new') {
                if (editingPreset.thumbnailFile) {
                    const newPreset = await createPreset(
                        editingPreset.name,
                        currentSettings,
                        editingPreset.thumbnailFile
                    );

                    if (newPreset) {
                        showMessage(t('dialogs.presets.createSuccess', 'Preset created successfully'), 'success');
                        onClose();
                    } else {
                        showMessage(t('dialogs.presets.createError', 'Cannot create preset. Please try again.'), 'error');
                    }
                }
            } else if (presetOption === 'override' && editingPreset.id) {
                const success = await updatePreset(
                    editingPreset.id,
                    editingPreset.name,
                    currentSettings,
                    editingPreset.thumbnailFile || undefined
                );

                if (success) {
                    showMessage(t('dialogs.presets.updateSuccess', 'Preset updated successfully'), 'success');
                    onClose();
                } else {
                    showMessage(t('dialogs.presets.updateError', 'Cannot update preset. Please try again.'), 'error');
                }
            }
        } catch (error) {
            console.error('Error saving preset:', error);
            showMessage(t('dialogs.presets.saveError', 'An error occurred while saving the preset'), 'error');
        }
    };

    // Render Step 1: Select option (new or override)
    const renderSelectOptionStep = () => (
        <>
            <DialogTitle>{t('dialogs.presets.uploadPreset', 'Upload Preset')}</DialogTitle>
            <DialogContent>
                <Box sx={{ width: '100%', mt: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        {t('dialogs.presets.selectOption', 'Select an option')}
                    </Typography>
                    
                    <RadioGroup
                        value={presetOption}
                        onChange={(e) => setPresetOption(e.target.value as 'new' | 'override')}
                    >
                        <FormControlLabel 
                            value="new" 
                            control={<Radio />} 
                            label={t('dialogs.presets.createNew', 'Create new preset')}
                        />
                        <FormControlLabel 
                            value="override" 
                            control={<Radio />} 
                            label={t('dialogs.presets.overrideExisting', 'Override existing preset')}
                        />
                    </RadioGroup>

                    {presetOption === 'override' && (
                        <Box sx={{ mt: 2, mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                {t('dialogs.presets.selectPreset', 'Select preset to override')}
                            </Typography>
                            
                            {userPresets.length > 0 ? (
                                <Box 
                                    sx={{
                                        mt: 1,
                                        maxHeight: 'calc(76px * 4)', // Chiều cao tối đa cho 4 item
                                        overflowY: 'auto',
                                        border: '1px solid rgba(0, 0, 0, 0.12)',
                                        borderRadius: 1,
                                        '&::-webkit-scrollbar': {
                                            width: '8px',
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                            backgroundColor: 'rgba(0,0,0,0.2)',
                                            borderRadius: '4px',
                                        }
                                    }}
                                >
                                    {userPresets.map((preset) => (
                                        <Box
                                            key={preset.id}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                p: 1.5,
                                                cursor: 'pointer',
                                                borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                                                backgroundColor: editingPreset.id === preset.id ? 'rgba(63, 81, 181, 0.08)' : 'transparent',
                                                '&:hover': { 
                                                    backgroundColor: editingPreset.id === preset.id 
                                                        ? 'rgba(63, 81, 181, 0.12)' 
                                                        : 'rgba(0, 0, 0, 0.04)' 
                                                },
                                                '&:last-child': {
                                                    borderBottom: 'none'
                                                }
                                            }}
                                            onClick={() => handlePresetSelect(preset.id!)}
                                        >
                                            <Box 
                                                component="img"
                                                src={`${PresetService.getPresetThumbnailUrl(preset)}`}
                                                alt={preset.name}
                                                sx={{ 
                                                    width: 60, 
                                                    height: 45,
                                                    objectFit: 'cover',
                                                    borderRadius: 1,
                                                    mr: 2,
                                                    border: '1px solid rgba(0, 0, 0, 0.1)'
                                                }}
                                                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                                    e.currentTarget.src = '/common/imgs/image-not-found.png';
                                                }}
                                            />
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="body1" fontWeight={editingPreset.id === preset.id ? 'bold' : 'normal'}>
                                                    {preset.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {t('dialogs.presets.createdAt', 'Created at')}: {
                                                        preset.createTime ? new Date(preset.createTime * 1000).toLocaleString() : 'N/A'
                                                    }
                                                </Typography>
                                            </Box>
                                            {editingPreset.id === preset.id && (
                                                <Box 
                                                    sx={{ 
                                                        width: 8, 
                                                        height: 8, 
                                                        borderRadius: '50%', 
                                                        bgcolor: 'primary.main',
                                                        mr: 1
                                                    }} 
                                                />
                                            )}
                                        </Box>
                                    ))}
                                </Box>
                            ) : (
                                <Typography color="text.secondary">
                                    {t('dialogs.presets.noPresetsAvailable', 'No preset available to override')}
                                </Typography>
                            )}
                        </Box>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('common.cancel', 'Cancel')}</Button>
                <Button 
                    onClick={handleNext} 
                    variant="contained" 
                    color="primary"
                >
                    {t('common.next', 'Next')}
                </Button>
            </DialogActions>
        </>
    );

    // Render Step 2: Enter preset information
    const renderEnterInfoStep = () => (
        <>
            <DialogTitle>{t('dialogs.presets.presetInfo', 'Preset Information')}</DialogTitle>
            <DialogContent>
                <Box sx={{ width: '100%', mt: 2 }}>
                    <TextField
                        label={t('dialogs.presets.presetName', 'Preset Name')}
                        fullWidth
                        value={editingPreset.name}
                        onChange={handleNameChange}
                        margin="normal"
                        variant="outlined"
                    />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, mb: 1 }}>
                        <Typography variant="subtitle1">
                            {t('dialogs.presets.presetThumbnail', 'Preset Thumbnail')}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                                {t('dialogs.presets.displayMode', 'Display mode:')}
                            </Typography>
                            <ToggleButtonGroup
                                size="small"
                                value={fitMode}
                                exclusive
                                onChange={handleFitModeChange}
                                aria-label="image fit mode"
                            >
                                <ToggleButton value="contain">
                                    <Tooltip title={t('dialogs.presets.fitImage', 'Fit entire image')}>
                                        <FitScreenIcon fontSize="small" />
                                    </Tooltip>
                                </ToggleButton>
                                <ToggleButton value="cover">
                                    <Tooltip title={t('dialogs.presets.fillFrame', 'Fill frame (may crop)')}>
                                        <CropOriginalIcon fontSize="small" />
                                    </Tooltip>
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Box>
                    </Box>
                    
                    <Box 
                        sx={{
                            border: '1px solid rgba(0, 0, 0, 0.12)',
                            borderRadius: 1,
                            overflow: 'hidden',
                            mb: 2,
                            aspectRatio: '16/9', // Tỉ lệ khung hình 16:9
                            width: '100%',
                            maxHeight: '360px',
                        }}
                    >
                        {/* Image Preview Area */}
                        <Box 
                            sx={{ 
                                height: '100%',
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                bgcolor: 'rgba(0, 0, 0, 0.03)',
                                cursor: 'pointer',
                                overflow: 'hidden'
                            }}
                            onClick={handleUploadClick}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleFileSelect}
                            />
                            
                            {editingPreset.thumbnailPreview ? (
                                <>
                                    <Box 
                                        component="img"
                                        src={editingPreset.thumbnailPreview}
                                        alt="Preset thumbnail preview"
                                        sx={{ 
                                            width: '100%',
                                            height: '100%',
                                            objectFit: fitMode,
                                            backgroundColor: fitMode === 'contain' ? 'rgba(0, 0, 0, 0.03)' : 'transparent'
                                        }}
                                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                            e.currentTarget.src = '/common/imgs/image-not-found.png';
                                        }}
                                    />
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            bgcolor: 'rgba(0, 0, 0, 0.5)',
                                            color: 'white',
                                            p: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.875rem',
                                            fontWeight: 'medium',
                                            transition: 'opacity 0.2s',
                                            opacity: 0,
                                            '&:hover': {
                                                opacity: 1
                                            }
                                        }}
                                    >
                                        <ImageIcon sx={{ mr: 1, fontSize: '1rem' }} />
                                        {t('dialogs.presets.changeImage', 'Change Image')}
                                    </Box>
                                </>
                            ) : (
                                <Box 
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        p: 3,
                                        textAlign: 'center'
                                    }}
                                >
                                    <AddPhotoAlternateIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                                    <Typography variant="body1" color="text.secondary" gutterBottom>
                                        {t('dialogs.presets.clickToSelectImage', 'Click to select an image')}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {t('dialogs.presets.recommendedSize', 'Recommended ratio: 16:9')}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                        
                        {/* Upload Controls */}
                        <Box 
                            sx={{ 
                                p: 2,
                                bgcolor: 'background.paper',
                                borderTop: '1px solid rgba(0, 0, 0, 0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Typography variant="body2" color="text.secondary">
                                {editingPreset.thumbnailFile 
                                    ? t('dialogs.presets.fileSelected', 'File: {{name}}', { name: editingPreset.thumbnailFile.name })
                                    : editingPreset.thumbnailPreview 
                                        ? t('dialogs.presets.existingImage', 'Using existing image') 
                                        : t('dialogs.presets.noFileSelected', 'No file selected')
                                }
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleBack}>{t('common.back', 'Back')}</Button>
                <Button 
                    onClick={handleSavePreset} 
                    variant="contained" 
                    color="primary"
                    disabled={isSaving}
                >
                    {isSaving 
                        ? t('dialogs.presets.saving', 'Saving...') 
                        : t('dialogs.presets.savePreset', 'Save Preset')}
                </Button>
            </DialogActions>
        </>
    );

    return (
        <>
            <Dialog 
                open={open} 
                onClose={onClose}
                fullWidth
                maxWidth="md"
                sx={{
                    zIndex: 100000,
                }}
                // Đảm bảo dialog luôn ở trên cùng
                disableEnforceFocus
            >
                {currentMode === UploadMode.SELECT_OPTION && renderSelectOptionStep()}
                {currentMode === UploadMode.ENTER_INFO && renderEnterInfoStep()}
            
                
                {/* Snackbar thông báo */}
                <Snackbar 
                    open={snackbar.open} 
                    autoHideDuration={6000} 
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    sx={{ zIndex: 100001 }} // Z-index cao hơn Dialog
                >
                    <Alert 
                        onClose={handleCloseSnackbar} 
                        severity={snackbar.severity}
                        variant="filled"
                        sx={{ width: '100%' }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Dialog>
        </>
    );
};

export default PresetUploadModal;