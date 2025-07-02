import * as React from "react";
import {useEffect, useState, useCallback, useMemo} from "react";
import {DialogCard} from "../../../../../components/container/dialog-card";
import {DialogComponentProps} from "../../../../../dialogs";
import {useTranslation} from "react-i18next";
import {storyWithId, updateStory, useStoriesContext} from "../../../../../store/stories";
import {Box, Button, Typography, CircularProgress} from "@mui/material";
import {TwineSettingGroupCard} from "../TwineSettingsMuiTemplate";
import {TwineGameSetting} from "../../../../../common/twine-game-setting";
import EvtMgr, {EventName} from "../../../../../common/evt-mgr";
import {EndMenuSettingContext} from "./end-menu-settings-context";
import {EndMenuSettingGroup} from "./end-menu-setting-group";
import {EndMenuSettingMgr} from "../../../../../common/end-menu-setting-mgr";
import { PresetUploadModal } from "../../preset-settings/preset-upload-modal";
import { PresetList } from "../../preset-settings/preset-list";
import UploadIcon from '@mui/icons-material/Upload';
import { usePresetSettings } from "../../preset-settings/preset-settings-context";
import _, { debounce } from "lodash";
import { defaultSettings } from "../../../../../store/prefs/defaults";

export interface EndMenuSettingsProps extends DialogComponentProps {
	storyId: string;
}

export function EndMenuSettings(props: EndMenuSettingsProps) {
	const {storyId, ...other} = props;
	const {t} = useTranslation();

	const {showPresetEndMenu} = defaultSettings;
	
	// Context và states
	const {dispatch, stories} = useStoriesContext();
	const story = storyWithId(stories, storyId);
	const {showUploadModal, setShowUploadModal} = usePresetSettings();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [hasError, setHasError] = useState<boolean>(false);

	// Main state for settings
	const settings = EndMenuSettingMgr.fromRawObj(story?.storySetting?.endMenuSetting, story);
	const groupNames = useMemo(() => settings?.getGroupNames() || [], [settings]);

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
					storySetting.endMenuSetting = newSettings.toRaw();
					
					// Signal that changes are incoming
					EvtMgr.emit(EventName.twineGameSettingsChangeIncoming, storySetting);

					dispatch(updateStory(stories, story, { storySetting }));
					EvtMgr.emit(EventName.twineGameSettingsChangeApplied, storySetting);
					setHasError(false);
				} catch (error) {
					console.error("Failed to save end menu settings:", error);
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
	const handleSettingChange = useCallback((ev, bundle: {
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
	}, [settings, debouncedSaveSettingsToStory]);

	/**
	 * Activate preview mode when component is mounted
	 */
	useEffect(() => {
		EvtMgr.emit(EventName.enableDemoModal, {needEnable: true});
		return () => {
			EvtMgr.emit(EventName.enableDemoModal, {needEnable: false});
		}
	}, []);

	return (
		<DialogCard
			{...other}
			className="story-settings-end-menu-dialog"
			headerLabel={t('dialogs.storySettings.endMenuTitle')}
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
					{/* Presets area */}
					{showPresetEndMenu && (
						<Box sx={{ mb: 3 }}>
							<TwineSettingGroupCard sx={{ mb: 0 }}>
								<PresetList storyId={storyId} />
							</TwineSettingGroupCard>
						</Box>
					)}

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
					
					<EndMenuSettingContext.Provider value={{
						twineGameSetting: settings,
						changeSettingsByFieldPath: handleSettingChange,
					}}>
						{!hasError && groupNames.length === 0 && (
							<Typography color="text.secondary" sx={{ textAlign: 'center', my: 2 }}>
								{t('dialogs.storySettings.noSettings', 'No end menu settings found')}
							</Typography>
						)}
						
						{groupNames.map((groupName, index) => (
							<TwineSettingGroupCard key={groupName} sx={{ mb: index < groupNames.length - 1 ? 3 : 0 }}>
								<EndMenuSettingGroup groupName={groupName}/>
							</TwineSettingGroupCard>
						))}
					</EndMenuSettingContext.Provider>
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
			{showUploadModal && showPresetEndMenu && (
				<PresetUploadModal 
					open={showUploadModal}
					onClose={() => setShowUploadModal(false)}
					storyId={storyId}
				/>
			)}
		</DialogCard>
	);
} 