import React, {
	createContext,
	useContext,
	useState,
	useEffect,
	ReactNode
} from 'react';
import EvtMgr, {EventName} from '../../../../common/evt-mgr';
import {Story, StorySetting, updateStory, useStoriesContext} from '../../../../store/stories';

import {
    Preset,
    PresetSettings,
	PresetService
} from './preset-services';
import { cloneDeep } from 'lodash';
interface PresetSettingsContextProps {
	userPresets: Preset[];
    recommendedPresets: Preset[];
	isLoading: boolean;
    isSaving: boolean;
	error: string | null;

    loadRecommendedPresets: () => Promise<Preset[]>;
	loadUserPresets: (query?: string) => Promise<Preset[]>;
	createPreset: (
		name: string,
		template: any,
		thumbnail: File
	) => Promise<Preset | undefined>;
	updatePreset: (
		id: number,
		name: string,
		settings: any,
		thumbnail?: File
	) => Promise<boolean>;
	applyPreset: (story: Story, preset: Preset) => Promise<void>;
	previewPreset: (story: Story, preset: Preset) => Promise<void>;
	restorePreset: (story: Story) => Promise<void>;

    showUploadModal: boolean;
    setShowUploadModal: (show: boolean) => void;
}

const PresetSettingsContext = createContext<
	PresetSettingsContextProps | undefined
>(undefined);

interface PresetSettingsProviderProps {
	children: ReactNode;
}

// Helpers
const appendPresetSettingsToStory = (story: Story, presetSettings: PresetSettings): Story => {
    story.storySetting = story.storySetting || {};

    if (presetSettings.characterDialogSetting) {
        story.storySetting.characterDialogSetting = presetSettings.characterDialogSetting;
    }

    if (presetSettings.startMenuSetting) {
        story.storySetting.startMenuSetting = presetSettings.startMenuSetting;
    }

    return story;
}

export const PresetSettingsProvider: React.FC<PresetSettingsProviderProps> = ({
	children
}) => {
    const [recommendedPresets, setRecommendedPresets] = useState<Preset[]>([]);
	const [userPresets, setUserPresets] = useState<Preset[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
    const [cachedStorySettings, setCachedStorySettings] = useState<StorySetting | null>(null);   // Cached story settings for preview
    const [showUploadModal, setShowUploadModal] = useState<boolean>(false);

	const {dispatch, stories} = useStoriesContext();

    const loadRecommendedPresets = async (): Promise<Preset[]> => {
        setError(null);
        setIsLoading(true);
        try {
            const recommendedPresets = await PresetService.fetchRecommendedPresets();
            setRecommendedPresets(recommendedPresets || []);
            return recommendedPresets;
        } catch (error) {
            console.error('Error loading recommended presets:', error);
            setRecommendedPresets([]);
            return [];
        } finally {
            setIsLoading(false);
        }
    }

    const loadUserPresets = async (): Promise<Preset[]> => {
        setError(null);
        setIsLoading(true);
        try {
            const loadedPresets = await PresetService.findUserPresets();
            setUserPresets(loadedPresets || []);
            return userPresets;
        } catch (error) {
            console.error('Error loading presets:', error);
            setError('Failed to load presets');
            return [];
        } finally {
            setIsLoading(false);
        }
    }

    // Helper function to update story settings and emit events
	const notifySettings = async (
		story: Story
	): Promise<void> => {
		const { storySetting } = story;

		// Send event to update settings
		EvtMgr.emit(EventName.twineGameSettingsChangeIncoming, storySetting);

		// Wait 1 second to ensure settings are updated
		await new Promise(resolve => setTimeout(resolve, 100));

		// Update settings
		dispatch(updateStory(stories, story, { storySetting }));
		EvtMgr.emit(EventName.twineGameSettingsChangeApplied, storySetting);

        EvtMgr.emit(EventName.APPLY_PRESET_SETTINGS, storySetting);
	};

	const applyPreset = async (story: Story, preset: Preset): Promise<void> => {
		try {
			const presetSettings = await PresetService.getPresetSettings(preset);

            appendPresetSettingsToStory(story, presetSettings);

			await notifySettings(story);

			// Cache preset path into story
			story.presetPath = preset.path;
		} catch (error) {
			console.error('Error fetching template:', error);
		}
	};

    const previewPreset = async (story: Story, preset: Preset): Promise<void> => {
        try {
            // Save current settings
            const currentStorySetting = story.storySetting || {};
            setCachedStorySettings(cloneDeep(currentStorySetting));

            await applyPreset(story, preset);
        } catch (error) {
            console.error('Error fetching template:', error);
        }
    };

    const restorePreset = async (story: Story): Promise<void> => {
        if (!cachedStorySettings) {
            console.error('No cached story settings found');
            return;
        }

        try {
            story.storySetting = cachedStorySettings;
            setCachedStorySettings(null);
            await notifySettings(story);
        } catch (error) {
            console.error('Error restoring preset:', error);
        }
    };

    const createPreset = async (
        name: string,
        settings: any,
        thumbnail: File
    ): Promise<Preset | undefined> => {
        setIsSaving(true);
        setError(null);

        try {
            const newPreset = await PresetService.uploadNewPreset(name, settings, thumbnail);
            
            if (newPreset) {
                // Update the list of presets
                setUserPresets(prevPresets => [
                    ...prevPresets,
                    newPreset
                ]);
            }
            
            return newPreset;
        } catch (error) {
            console.error('Error creating preset:', error);
            setError('Failed to create preset');
            return undefined;
        } finally {
            setIsSaving(false);
        }
    };

    const updatePreset = async (
        id: number,
        name: string,
        settings: any,
        thumbnail?: File
    ): Promise<boolean> => {
        setIsSaving(true);
        setError(null);

        try {
            const success = await PresetService.uploadExistingPreset(id, name, settings, thumbnail);        
            if (success) {
                // Update the list of presets
                setUserPresets(prevPresets => 
                    prevPresets.map(preset => 
                        preset.id === id 
                            ? { ...preset, name } 
                            : preset
                    )
                );
            }
            
            return success;
        } catch (error) {
            console.error('Error updating preset:', error);
            setError('Failed to update preset');
            return false;
        } finally {
            setIsSaving(false);
        }
    };

	// Load presets when component is mounted
	useEffect(() => {
        loadRecommendedPresets();
		loadUserPresets();
	}, []);

	const value: PresetSettingsContextProps = {
		userPresets,
        recommendedPresets,
		isLoading,
        isSaving,
		error,
		loadRecommendedPresets,
		loadUserPresets,
		createPreset,
		updatePreset,
		applyPreset,
		previewPreset,
		restorePreset,

        showUploadModal,
        setShowUploadModal,
	};

	return (
		<PresetSettingsContext.Provider value={value}>
			{children}
		</PresetSettingsContext.Provider>
	);
};

export const usePresetSettings = (): PresetSettingsContextProps => {
	const context = useContext(PresetSettingsContext);
	if (context === undefined) {
		throw new Error('usePresetSettings must be used within a PresetSettingsProvider');
	}
	return context;
};

export default PresetSettingsContext;

export const usePresetDetails = (preset: Preset | null) => {
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
    const [settingsUrl, setSettingsUrl] = useState<string | null>(null);
    const [settings, setSettings] = useState<PresetSettings | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        if (!preset) {
            setThumbnailUrl('');
            setSettings(null);
            return;
        }

        const loadDetails = async () => {
            setIsLoading(true);
            setError(null);
            try {
                setThumbnailUrl(PresetService.getPresetThumbnailUrl(preset));
                setSettingsUrl(PresetService.getPresetSettingsUrl(preset));
                const settings = await PresetService.getPresetSettings(preset);
                if (isMounted) {
                    setSettings(settings); 
                }
            } catch (err) {
                console.error('Error fetching preset details:', err);
                if (isMounted) {
                    setError('Failed to load preset details');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadDetails();
    }, [preset]);

    return { thumbnailUrl, settingsUrl, settings, isLoading, error };
};