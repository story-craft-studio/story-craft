import * as React from "react";
import {useEffect, useState, useCallback, useMemo} from "react";
import {DialogCard} from "../../../../../components/container/dialog-card";
import {DialogComponentProps} from "../../../../../dialogs";
import {useTranslation} from "react-i18next";
import {storyWithId, updateStory, useStoriesContext} from "../../../../../store/stories";
import {Box, Button, Typography, CircularProgress, FormControl, InputLabel, Select, MenuItem, Tooltip, SelectChangeEvent, Dialog, DialogTitle, DialogContent, DialogActions} from "@mui/material";
import {TwineSettingGroupCard} from "../TwineSettingsMuiTemplate";
import {CDialogSettingContext} from "./character-dialog-settings-context";
import {CDialogSettingGroup} from "./character-dialog-setting-group";
import {CharacterDialogSettingMgr} from "../../../../../common/character-dialog-setting-mgr";
import {TwineGameSetting} from "../../../../../common/twine-game-setting";
import EvtMgr, {EventName} from "../../../../../common/evt-mgr";
import { PresetUploadModal } from "../../preset-settings/preset-upload-modal";
import { PresetList } from "../../preset-settings/preset-list";
import UploadIcon from '@mui/icons-material/Upload';
import { usePresetSettings } from "../../preset-settings/preset-settings-context";
import _, { cloneDeep, debounce } from "lodash";
import ScreenRotationIcon from '@mui/icons-material/ScreenRotation';
import LandscapeIcon from '@mui/icons-material/Landscape';
import PortraitIcon from '@mui/icons-material/Portrait';
import { Switch, FormControlLabel } from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';

export interface CharacterDialogSettingsProps extends DialogComponentProps {
	storyId: string;
}

export function DialogSettings(props: CharacterDialogSettingsProps) {
	const {storyId, ...other} = props;
	const {t} = useTranslation();
	
	// Context và states
	const {stories, dispatch} = useStoriesContext();
	const story = storyWithId(stories, storyId);
	const {showUploadModal, setShowUploadModal} = usePresetSettings();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [hasError, setHasError] = useState<boolean>(false);

	// Main state for settings
	const settings = CharacterDialogSettingMgr.fromRawObj(story?.storySetting?.characterDialogSetting);
	const groupNames = useMemo(() => settings?.getGroupNames() || [], [settings]);

	// Add orientation state
	const [orientation, setOrientation] = useState<'landscape' | 'portrait'>(
		stories.find(s => s.id === storyId)?.orientation || 'landscape'
	);

	// Add remix enabled state
	const [remixEnabled, setRemixEnabled] = useState<boolean>(
		stories.find(s => s.id === storyId)?.remixEnabled || false
	);

	// Add advanced settings modal state
	const [isAdvancedSettingsOpen, setIsAdvancedSettingsOpen] = useState<boolean>(false);

	// Add orientation change handler
	const handleOrientationChange = (event: SelectChangeEvent) => {
		const story = stories.find(s => s.id === storyId);
		if (!story) return;
		
		const newOrientation = event.target.value as 'landscape' | 'portrait';
		setOrientation(newOrientation);
		
		// Update story state
		dispatch(updateStory(stories, story, {
			orientation: newOrientation
		}));
		
		console.log('Orientation changed to:', newOrientation);
	};

	// Add remix enable change handler
	const handleRemixEnabledChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const story = stories.find(s => s.id === storyId);
		if (!story) return;
		
		const newValue = event.target.checked;
		setRemixEnabled(newValue);
		
		// Update story state
		dispatch(updateStory(stories, story, {
			remixEnabled: newValue
		}));
		
		console.log('Remix enabled changed to:', newValue);
	};

	// Update orientation and remix enabled when story changes
	useEffect(() => {
		const story = stories.find(s => s.id === storyId);
		if (story) {
			setOrientation(story.orientation || 'landscape');
			setRemixEnabled(story.remixEnabled || false);
		}
	}, [storyId, stories]);

	/**
	 * Create memoized debounced save function
	 */
	const debouncedSaveSettingsToStory = useMemo(
		() => {
			/**
			 * Save settings to story and emit event
			 */
			return debounce((newSettings: TwineGameSetting) => {
				if (!story || !newSettings) return;
				
				try {
					setIsLoading(true);
					const storySetting = story.storySetting || {};
					storySetting.characterDialogSetting = newSettings.toRaw();
					
					// Signal that changes are incoming
					EvtMgr.emit(EventName.twineGameSettingsChangeIncoming, storySetting);

					dispatch(updateStory(stories, story, { storySetting }));
					EvtMgr.emit(EventName.twineGameSettingsChangeApplied, storySetting);
					setHasError(false);
				} catch (error) {
					console.error("Failed to save dialog settings:", error);
					setHasError(true);
				} finally {
					setIsLoading(false);
				}
			}, 500);
		},
		[story, stories, dispatch]
	);

	/**
	 * Handle when a specific property in settings changes
	 */
	const handleSettingFieldChange = useCallback((ev, bundle: {
		groupName: string,
		propertyName: string,
		newValue: any,
		valueUnit: string,
	}) => {
		const {groupName, propertyName, newValue, valueUnit} = bundle;

		if (settings) {
			// Update settings
			settings.withGroup(groupName).setProperty(propertyName, {
				value: newValue,
				unit: valueUnit,
			});

			debouncedSaveSettingsToStory(settings);
		}

		return () => {
			debouncedSaveSettingsToStory.cancel(); // Cleanup
		};

	}, []);

	/**
	 * Activate preview mode when component is mounted
	 */
	useEffect(() => {
		EvtMgr.emit(EventName.enableDemoModal, {needEnable: true});
		EvtMgr.emit(EventName.dialogSettingsMounted);		// Dispatch event to show demo character
		return () => {
			EvtMgr.emit(EventName.enableDemoModal, {needEnable: false});
		}
	}, []);

	return (
		<DialogCard
			{...other}
			className="story-settings-character-dialog"
			headerLabel={t('dialogs.storySettings.title')}
		>
			<Box sx={{
				display: 'flex', 
				flexDirection: 'column', 
				height: 'calc(100% - 40px)',
				position: 'relative'
			}}>
				{/* Scrollable content area */}
				<Box sx={{
					overflowY: 'auto', 
					flex: 1,
					paddingBottom: '20px',
					paddingX: '12px'
				}}>
					{/* Advanced Settings Button */}
					<Box sx={{ mb: 3 }}>
						<TwineSettingGroupCard sx={{ mb: 0 }}>
							<Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
								<Button
									variant="outlined"
									startIcon={<SettingsIcon />}
									onClick={() => setIsAdvancedSettingsOpen(true)}
									sx={{
										textTransform: 'none',
										fontWeight: 'medium',
										borderRadius: '8px',
										px: 3,
										py: 1
									}}
								>
									{t('Advanced Settings')}
								</Button>
							</Box>
						</TwineSettingGroupCard>
					</Box>

					{/* Presets area */}
					<Box sx={{ mb: 3 }}>
						<TwineSettingGroupCard sx={{ mb: 0 }}>
							<PresetList storyId={storyId} />
						</TwineSettingGroupCard>
					</Box>

					{/* Settings area */}
					{isLoading && (
						<Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
							<CircularProgress size={24} />
						</Box>
					)}
					
					{hasError && (
						<Typography color="error" sx={{ my: 2, textAlign: 'center' }}>
							{t('dialogs.storySettings.loadError', 'An error occurred while loading settings. Please try again.')}
						</Typography>
					)}
					
					<CDialogSettingContext.Provider value={{
						twineGameSetting: settings,
						changeSettingsByFieldPath: handleSettingFieldChange,
					}}>
						{!hasError && groupNames.length === 0 && (
							<Typography color="text.secondary" sx={{ textAlign: 'center', my: 2 }}>
								{t('dialogs.storySettings.noSettings', 'No character dialog settings found')}
							</Typography>
						)}
						
						{groupNames.map((groupName, index) => (
							<TwineSettingGroupCard key={groupName} sx={{ mb: index < groupNames.length - 1 ? 3 : 0 }}>
								<CDialogSettingGroup groupName={groupName}/>
							</TwineSettingGroupCard>
						))}
					</CDialogSettingContext.Provider>
				</Box>
				
				{/* Footer with Upload Template button */}
				<Box sx={{ 
					mt: 2,
					pt: 2,
					pb: 2,
					borderTop: '1px solid rgba(0, 0, 0, 0.12)',
					display: 'flex',
					justifyContent: 'flex-end',
					position: 'sticky',
					bottom: 0,
					backgroundColor: 'white',
					minHeight: '50px',
					zIndex: 1,
					boxShadow: '0px -2px 4px rgba(0, 0, 0, 0.05)',
					paddingX: '20px'
				}}>
					<Button
						variant="contained"
						color="primary"
						startIcon={<UploadIcon />}
						onClick={() => setShowUploadModal(true)}
						sx={{ textTransform: 'none' }}
						disabled={isLoading}
					>
						{t('dialogs.presets.uploadPreset', 'Upload Template')}
					</Button>
				</Box>
			</Box>

			{/* Upload preset modal */}
			{showUploadModal && (
				<PresetUploadModal 
					open={showUploadModal}
					onClose={() => setShowUploadModal(false)}
					storyId={storyId}
				/>
			)}

			{/* Advanced Settings Modal */}
			<Dialog
				open={isAdvancedSettingsOpen}
				onClose={() => setIsAdvancedSettingsOpen(false)}
				maxWidth="sm"
				fullWidth
				PaperProps={{
					sx: {
						borderRadius: '12px',
						minHeight: '400px'
					}
				}}
			>
				<DialogTitle sx={{ 
					display: 'flex', 
					justifyContent: 'space-between', 
					alignItems: 'center',
					pb: 1
				}}>
					<Typography variant="h6" component="div">
						{t('Advanced Settings')}
					</Typography>
					<Button
						onClick={() => setIsAdvancedSettingsOpen(false)}
						sx={{ minWidth: 'auto', p: 1 }}
						color="inherit"
					>
						<CloseIcon />
					</Button>
				</DialogTitle>
				<DialogContent sx={{ pb: 2 }}>
					<Box sx={{ mt: 1 }}>
						{/* Story Orientation */}
						<Box sx={{ mb: 4 }}>
							<Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
								{t('Story Orientation')}
							</Typography>
							<FormControl 
								sx={{ 
									minWidth: 200,
									'.MuiOutlinedInput-root': {
										height: 45,
									}
								}}
								size="medium"
							>
								<InputLabel 
									id="orientation-select-label"
									sx={{
										display: 'flex',
										alignItems: 'center',
									}}
								>
									<ScreenRotationIcon sx={{ mr: 0.5, fontSize: 18 }} />
									{t('orientation')}
								</InputLabel>
								<Select
									labelId="orientation-select-label"
									id="orientation-select"
									value={orientation}
									label={t('orientation')}
									onChange={handleOrientationChange}
								>
									<MenuItem value="landscape">
										<div style={{ display: 'flex', alignItems: 'center' }}>
											<LandscapeIcon sx={{ mr: 1, fontSize: 18 }} />
											{t('landscape')}
										</div>
									</MenuItem>
									<MenuItem value="portrait">
										<div style={{ display: 'flex', alignItems: 'center' }}>
											<PortraitIcon sx={{ mr: 1, fontSize: 18 }} />
											{t('portrait')}
										</div>
									</MenuItem>
								</Select>
							</FormControl>
						</Box>

						{/* Remix Enable Setting */}
						<Box>
							<Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
								{t('Remix Settings')}
							</Typography>
							<FormControlLabel
								control={
									<Switch
										checked={remixEnabled}
										onChange={handleRemixEnabledChange}
										color="primary"
										sx={{
											'& .MuiSwitch-switchBase.Mui-checked': {
												color: '#7209b7',
											},
											'& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
												backgroundColor: '#7209b7',
											},
										}}
									/>
								}
								label={
									<RestartAltIcon sx={{ fontSize: 18 }} />
								}
								labelPlacement="end"
							/>
							<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, ml: 4 }}>
								{t('Allow remix')}
							</Typography>
						</Box>
					</Box>
				</DialogContent>
				<DialogActions sx={{ px: 3, pb: 2 }}>
					<Button
						onClick={() => setIsAdvancedSettingsOpen(false)}
						variant="contained"
						color="primary"
						sx={{ textTransform: 'none' }}
					>
						{t('common.done')}
					</Button>
				</DialogActions>
			</Dialog>
		</DialogCard>
	);
}



