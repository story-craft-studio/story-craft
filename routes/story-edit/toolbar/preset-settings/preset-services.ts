import { cloneDeep } from "lodash";
import { DefaultService } from "../../../../_genApi/static-asset/services/DefaultService";
export type PresetType = 'SHARED';

export interface Preset {
    id?: number;
    name: string;
    ownerId?: number;
    path?: string;
    presetType: PresetType;
    createTime?: number;        // seconds
    recommend?: boolean;
}

export type PresetSettings = {
    startMenuSetting?: any;
	characterDialogSetting?: any,
}

export class PresetService {
   // Mock presets for development
    static readonly mockPresets: Preset[] = [
        {
            id: 0,
            name: 'Preset 1',
            path: '',
            presetType: 'SHARED',
            ownerId: 1,
            createTime: Date.now() / 1000,
            recommend: true
        }
    ];

    static readonly DEFAULT_THUMBNAIL = '';

    static readonly DEFAULT_SETTINGS: PresetSettings = {
        characterDialogSetting: {
            background: {
                dialogBackgroundImage: {
                    value: ""
                },
                dialogBackgroundColor: {
                    value: "#f5f5f5"
                },
                titleBackgroundImage: {
                    value: ""
                },
                titleBackgroundColor: {
                    value: "#f5f5f5"
                }
            },
            fontSize: {
                titleFontSize: {
                    value: 44,
                    unit: "px"
                },
                dialogFontSize: {
                    value: 16,
                    unit: "px"
                },
                dialogSize: {
                    value: 100
                },
                dialogPosition: {
                    value: {
                        x: 100,
                        y: 100
                    }
                }
            },
            textColor: {
                titleTextColor: {
                    value: "#333333"
                },
                dialogTextColor: {
                    value: "#333333"
                }
            }
        },
        startMenuSetting: {
            backgroundGrup: {
                backgroundColorOrImage: {
                    value: "",
                    inputType: "link",
                    assetType: "image"
                }
            },
            fontSize: {
                titleFontSize: {
                    value: 24,
                    inputType: "number",
                    unitsToChooseFrom: ["px", "em", "rem", "%"]
                }
            }
        }
    }

    // Cache for preset settings
    static readonly settingsCache = new Map<number, PresetSettings>();

    static isDevMode(): boolean {
        return process.env.NODE_ENV === 'development';
    }

    static async fetchRecommendedPresets() : Promise<Preset[]> {
        try {
            const response = await DefaultService.postApiListingPresetRecommended({
                minId: 0,
                numTake: 100
            });

            console.log('fetch recommended presets response', response);

            return response;
        } catch (err) {
            console.error('Error fetching recommended presets:', err);
            return [];
        }
    }
    
    static async findUserPresets(query = '') : Promise<Preset[]> {
        try {
            const response = await DefaultService.postApiListPreset({
                minId: 0,
                numTake: 100
            });

            console.log('fetch presets response', response);
            
            if (response && Array.isArray(response)) {
                return response;
            }
            return [];
        } catch (err) {
            console.error('Error fetching presets:', err);
            return [];
        }
    };

    static async uploadNewPreset(name: string, settings: any, thumbnail: File) : Promise<Preset | undefined> {
        try {
            const response = await DefaultService.postApiCreateNewPreset({
                name,
                content: JSON.stringify(settings),
                thumb: thumbnail
            });

            const success = response && response.presetId;
            if (!success) {
                throw new Error('Failed to create preset');
            }
            
            return {
                id: response.presetId,
                name,
                path: response.path,
                presetType: 'SHARED',
                createTime: Date.now() / 1000
            };
        } catch (err) {
            console.error('Error creating preset:', err);
            return undefined;
        }
    };
  
    static async uploadExistingPreset(id: number, name: string, settings: any, thumbnail?: File) : Promise<boolean> {
        try {
            const contentString = JSON.stringify(settings);
            const response = await DefaultService.postApiUpdatePreset({
                id,
                name,
                content: contentString,
                thumb: thumbnail
            });

            console.log('updatePreset response', response);

            // Update cache
            this.settingsCache.set(id, settings);
     
            return true;
        } catch (err) {
            console.error('Error updating preset:', err);
            return false;
        }
    };
    
    static getPresetThumbnailUrl(preset: Preset): string {
        if (!preset.path) {
            return this.DEFAULT_THUMBNAIL;
        }
        const serverUrl = DefaultService.getServerUrl();
        const thumbnailUrl = `${serverUrl}/game-preset/${preset.path}/thumb.png`;
        console.log('thumbnailUrl', thumbnailUrl);
        return thumbnailUrl;
    }

    static getPresetSettingsUrl(preset: Preset): string {
        if (!preset.path) {
            return '';
        }
        const serverUrl = DefaultService.getServerUrl();
        return `${serverUrl}/game-preset/${preset.path}/content.json`;
    }
    
    static async getPresetSettings(preset: Preset): Promise<PresetSettings> {
        if (!preset.id || !preset.path) {
            return this.DEFAULT_SETTINGS;
        }

        // Check cache
        const cachedSettings = this.settingsCache.get(preset.id);
        if (cachedSettings) {
            return cloneDeep(cachedSettings);
        }
    
        // Fetch from server
        const settings = await DefaultService.getApiPresetContent(preset.path);
        this.settingsCache.set(preset.id!, settings);
        return settings;
    }
}
