import * as React from 'react';
import {useState} from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Typography,
    IconButton,
    Menu,
    MenuItem,
    Tooltip,
    ButtonGroup,
    ListItemIcon,
    ListItemText,
    Divider,
    Chip,
    Snackbar,
    Alert
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ShareIcon from '@mui/icons-material/Share';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ImageIcon from '@mui/icons-material/Image';
import SettingsIcon from '@mui/icons-material/Settings';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import StarIcon from '@mui/icons-material/Star';
import RecommendIcon from '@mui/icons-material/Recommend';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {useTranslation} from 'react-i18next';
import { usePresetDetails, usePresetSettings} from './preset-settings-context';
import {useStoriesContext, storyWithId} from '../../../../store/stories';
import { Preset, PresetService } from './preset-services';

interface PresetItemProps {
	preset: Preset;
	viewMode: 'list' | 'grid';
	onApply?: (preset: Preset) => void;
	onPreview?: (preset: Preset) => void;
	onExport?: (preset: Preset) => void;
	onRefresh?: () => void;
	buttonStyle?: 'vertical' | 'horizontal';
	viewIconOnly?: boolean;
	storyId?: string;
}

export const PresetItem: React.FC<PresetItemProps> = ({
	preset,
	viewMode,
	onApply,
    onPreview,
	onExport,
	onRefresh,
	buttonStyle = 'vertical',
	viewIconOnly = false,
	storyId 
}) => {
	const [isHovered, setIsHovered] = useState(false);
	const {t} = useTranslation();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const {stories} = useStoriesContext();
	const story = storyId ? storyWithId(stories, storyId) : null;

	const [isPreviewing, setIsPreviewing] = useState(false);
    
    // Thêm state cho thông báo copy
    const [copySnackbar, setCopySnackbar] = useState({
        open: false,
        message: '',
    });

	const {
		applyPreset,
		previewPreset,
		restorePreset
	} = usePresetSettings();

    const {
        thumbnailUrl,
        settingsUrl,
        isLoading,
        error
    } = usePresetDetails(preset);
    const errorImg = '/common/imgs/image-not-found.png';

	const handleMouseEnter = () => {
		setIsHovered(true);
	};

	const handleMouseLeave = () => {
		setIsHovered(false);
        // When leaving preset, stop preview if it's currently previewing
		if (isPreviewing && story) {
			restorePreset(story);
			setIsPreviewing(false);
		}
	};

	const handleApply = async () => {
		if (story) {
			await applyPreset(story, preset);
			if (onApply) {
				onApply(preset);
			}
        }
    }
  
    const handleExport = (e: React.MouseEvent) => {
        e.stopPropagation();
        
        try {
            // Create an object containing preset information to export
            const exportData = {
                id: preset.id,
                name: preset.name,
                ownerId: preset.ownerId,
                createTime: preset.createTime
            };
            
            // Convert the object to a JSON string and format it with spaces
            const jsonString = JSON.stringify(exportData, null, 2);
            
            // Create a Blob from the JSON string
            const blob = new Blob([jsonString], { type: 'application/json' });
            
            // Create a URL from the Blob
            const url = URL.createObjectURL(blob);
            
            // Create an anchor tag to download
            const link = document.createElement('a');
            link.href = url;
            link.download = `preset-${preset.name.replace(/\s+/g, '-').toLowerCase()}.json`;
            
            // Add to body, click and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Release the created URL
            URL.revokeObjectURL(url);
            
            // Call the onExport callback if it exists
            if (onExport) {
                onExport(preset);
            }
        } catch (error) {
            console.error("Error exporting preset:", error);
            alert(t('dialogs.presets.exportError', 'An error occurred while exporting preset'));
        }
    };  

    // Thêm hàm để copy preset ID
    const handleCopyId = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (preset.id) {
            navigator.clipboard.writeText(preset.id.toString())
                .then(() => {
                    setCopySnackbar({
                        open: true,
                        message: t('dialogs.presets.idCopied', 'Preset ID copied to clipboard'),
                    });
                })
                .catch((err) => {
                    console.error('Could not copy preset ID: ', err);
                    setCopySnackbar({
                        open: true,
                        message: t('dialogs.presets.idCopyFailed', 'Failed to copy Preset ID'),
                    });
                });
        }
        handleMenuClose();
    };

    // Đóng thông báo copy
    const handleCloseCopySnackbar = () => {
        setCopySnackbar({
            ...copySnackbar,
            open: false,
        });
    };

    const handleViewThumbnail = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (thumbnailUrl) {
            window.open(thumbnailUrl, '_blank');
        }
    };
    
    const handleViewSettings = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (settingsUrl) {
            window.open(settingsUrl, '_blank');
        }
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };
    
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handlePreviewMouseEnter = (e: React.MouseEvent) => {
        e.stopPropagation();
        // When hovering over preset, start preview
        if (!isPreviewing && story) {
            setIsPreviewing(true);
            previewPreset(story, preset);
            if (onPreview) {
                onPreview(preset);
            }
        }
    };

    const handlePreviewMouseLeave = (e: React.MouseEvent) => {
        e.stopPropagation();
        // When leaving preset, stop preview if it's currently previewing
        if (isPreviewing && story) {
            restorePreset(story);
            setIsPreviewing(false);
        }
    };

    const canViewMenu = PresetService.isDevMode();

    return (
        <>
            <Card
                sx={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                    '&:hover': {
                        boxShadow: 3
                    },
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    bgcolor: 'white'
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <CardMedia
                    component="img"
                    height="140"
                    image={error ? errorImg : thumbnailUrl || errorImg}
                    alt={preset.name}
                    sx={{
                        height: '100%',
                        objectFit: 'cover'
                    }}
                />

                {/* Recommend ribbon - show only when preset is recommended */}
                {preset.recommend && (
                    <Tooltip title={t('dialogs.presets.adminRecommended', 'Recommended by admin')}>
                        <Box 
                            sx={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                bgcolor: 'error.main',
                                color: 'white',
                                p: 0.8,
                                borderRadius: '0 0px 0px 4px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 3,
                                width: 24,
                                height: 24,
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    transform: 'scale(1.1)'
                                }
                            }}
                        >
                            <StarIcon fontSize="small" />
                        </Box>
                    </Tooltip>
                )}

                {/* Text overlay on thumbnail */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.3) 70%, rgba(0,0,0,0))',
                        color: 'white',
                        p: 1.2,
                        pt: 1.0
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="subtitle2" noWrap sx={{textShadow: '1px 1px 2px rgba(0,0,0,0.8)', flex: 1, display: 'flex', gap: 0.0, alignItems: 'center'}}>
                            {preset.name}
                        </Typography>
                    </Box>
                </Box>
                
                {isHovered && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            bgcolor: 'rgba(0,0,0,0.4)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            zIndex: 2,
                            pb: 1
                        }}
                    >
                        {buttonStyle === 'vertical' ? (
                            <ButtonGroup
                                variant="contained"
                                orientation="vertical"
                                size="small"
                                sx={{mb: 0.5}}
                            >
                                <Tooltip title={t('dialogs.presets.preview')}>
                                    <IconButton
                                        color="info"
                                        onClick={handlePreviewMouseEnter}
                                        onMouseEnter={handlePreviewMouseEnter}
                                        onMouseLeave={handlePreviewMouseLeave}
                                        sx={{mb: 0.5, py: 0.3}}
                                    >
                                        {t('dialogs.presets.view')}
                                    </IconButton>
                                </Tooltip>
                                <Button
                                    startIcon={<CheckIcon sx={{fontSize: '0.9rem'}} />}
                                    color="success"
                                    onClick={handleApply}
                                    sx={{py: 0.3}}
                                >
                                    {t('dialogs.presets.apply')}
                                </Button>
                            </ButtonGroup>
                        ) : (
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    gap: 1.2,
                                    width: '100%',
                                    justifyContent: 'center'
                                }}
                            >
                                <Tooltip title={t('dialogs.presets.preview')}>
                                    <Button
                                        variant="contained"
                                        color="info"
                                        onMouseEnter={handlePreviewMouseEnter}
                                        onMouseLeave={handlePreviewMouseLeave}
                                        size="small"
                                        sx={{minWidth: '32px', width: '32px', height: '30px', p: 0}}
                                    >
                                        <VisibilityIcon sx={{fontSize: '1rem'}} />
                                    </Button>
                                </Tooltip>
                                <Button
                                    startIcon={viewIconOnly ? null : <CheckIcon sx={{fontSize: '0.9rem'}} />}
                                    color="success"
                                    onClick={handleApply}
                                    variant="contained"
                                    size="small"
                                    sx={{
                                        fontSize: '0.75rem',
                                        py: 0.3,
                                        height: '30px'
                                    }}
                                >
                                    {t('dialogs.presets.apply')}
                                </Button>
                            </Box>
                        )}

                        {canViewMenu && (
                            <Box sx={{position: 'absolute', top: 8, right: 8}}>
                                <IconButton
                                    size="small"
                                    aria-label="more"
                                    id="preset-menu-grid"
                                    aria-controls={open ? 'preset-menu-grid' : undefined}
                                    aria-expanded={open ? 'true' : undefined}
                                    aria-haspopup="true"
                                    onClick={handleMenuOpen}
                                    sx={{
                                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                                        '&:hover': {bgcolor: 'rgba(255, 255, 255, 1)'}
                                    }}
                                >
                                    <MoreVertIcon fontSize="small" />
                                </IconButton>
                                <Menu
                                    id="preset-menu-grid"
                                    anchorEl={anchorEl}
                                    open={open}
                                    onClose={handleMenuClose}
                                    MenuListProps={{
                                        'aria-labelledby': 'basic-button',  
                                    }}
                                >
                                    <MenuItem onClick={handleCopyId}>
                                        <ListItemIcon>
                                            <ContentCopyIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText>
                                            {t('dialogs.presets.copyId', 'Copy Preset ID')}
                                        </ListItemText>
                                    </MenuItem>
                                    
                                    <MenuItem onClick={e => {
                                        handleMenuClose();
                                        handleExport(e);
                                    }}>
                                        <ListItemIcon>
                                            <FileDownloadIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText>
                                            {t('common.export', 'Xuất JSON')}
                                        </ListItemText>
                                    </MenuItem>
                                    
                                    <Divider />
                                    
                                    <MenuItem onClick={e => {
                                        handleMenuClose();
                                        handleViewThumbnail(e);
                                    }}
                                    disabled={!thumbnailUrl || error === null}
                                    >
                                        <ListItemIcon>
                                            <ImageIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText>
                                            {t('dialogs.presets.viewThumbnail', 'View Thumbnail')}
                                        </ListItemText>
                                    </MenuItem>
                                    
                                    <MenuItem onClick={e => {
                                        handleMenuClose();
                                        handleViewSettings(e);
                                    }} 
                                    disabled={!settingsUrl || isLoading}
                                    >
                                        <ListItemIcon>
                                            <SettingsIcon fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText>
                                            {t('dialogs.presets.viewSettings', 'View Settings')}
                                        </ListItemText>
                                    </MenuItem>
                                </Menu>
                            </Box>
                        )}
                    </Box>
                )}
            </Card>
            
            {/* Thông báo khi sao chép ID thành công */}
            <Snackbar
                open={copySnackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseCopySnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleCloseCopySnackbar} 
                    severity="success" 
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {copySnackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default PresetItem;
