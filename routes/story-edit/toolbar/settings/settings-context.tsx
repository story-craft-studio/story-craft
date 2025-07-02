import React, {createContext, useContext, useState, useEffect} from 'react';
import {ActionDialogId, useDialogsContext} from '../../../../dialogs';
import {DialogSettings} from './dialog-settings/dialog-settings';
import {StartMenuSettings} from './start-menu-settings/start-menu-settings';
import {EndMenuSettings} from './end-menu-settings/end-menu-settings';
import { ChoiceMenuSettings } from './choice-menu-settings/choice-menu-settings';

// Settings list
export interface SettingConfig {
    id: ActionDialogId;
    label: string;
    component: React.ComponentType<any>;
}

// Settings list
export const SETTINGS_CONFIG: SettingConfig[] = [
    {
        id: 'DialogSettings' as ActionDialogId,
        label: 'routes.storyEdit.toolbar.dialog',
        component: DialogSettings
    },
    // Sau này có thể thêm Character Setting vào đây
    {
        id: 'StartMenuSettings' as ActionDialogId,
        label: 'routes.storyEdit.toolbar.startMenu',
        component: StartMenuSettings
    },
    {
        id: 'EndMenuSettings' as ActionDialogId,
        label: 'routes.storyEdit.toolbar.endMenu',
        component: EndMenuSettings
    },
    {
        id: 'ChoiceMenuSettings' as ActionDialogId,
        label: 'routes.storyEdit.toolbar.choiceMenu',
        component: ChoiceMenuSettings
    }
];

export const SETTINGS_DIALOG_IDS: ActionDialogId[] = SETTINGS_CONFIG.map(
    config => config.id
);

interface SettingsContextType {
    // State
    isGeneralSettingVisible: boolean;
    currentDialogIndex: number;
    currentDialogId: ActionDialogId | null;

    // Actions
    showGeneralSetting: () => void;
    hideGeneralSetting: () => void;
    openDialog: (index: number, props?: any) => void;
    closeDialog: (index: number) => void;
    openDialogById: (id: ActionDialogId, props?: any) => void;
    nextDialog: () => void;
    previousDialog: () => void;

    // Helpers
    settingsConfig: SettingConfig[];
}

// Create context
const SettingsContext = createContext<SettingsContextType | undefined>(
    undefined
);

// Props for provider
interface SettingsProviderProps {
    children: React.ReactNode;
    storyId?: string;
}

// Provider component
export const SettingsProvider: React.FC<SettingsProviderProps> = ({
                                                                      children,
                                                                      storyId
                                                                  }) => {
    const [isGeneralSettingVisible, setIsGeneralSettingVisible] = useState(false);
    const [currentDialogIndex, setCurrentDialogIndex] = useState(0);
    const {dispatch, dialogs} = useDialogsContext();

    // Actions
    const showGeneralSetting = () => setIsGeneralSettingVisible(true);
    const hideGeneralSetting = () => setIsGeneralSettingVisible(false);

    const openDialogById = (id: ActionDialogId, props = {}) => {
        if (!storyId) return;

        // Get config of dialog to open
        const targetConfigIndex = SETTINGS_CONFIG.findIndex(config => config.id === id);
        if (targetConfigIndex === -1) return;

        openDialog(targetConfigIndex, props);
    }

    // Open dialog by index
    const openDialog = (index: number, props = {}) => {
        if (!storyId) return;

        // Get config of dialog to open
        const targetConfig = SETTINGS_CONFIG[index];

        // Close all current dialogs
        SETTINGS_DIALOG_IDS.forEach(id => {
            dispatch({type: 'removeDialogById', id});
        });

        // Open new dialog
        dispatch({
            type: 'addDialog',
            id: targetConfig.id,
            component: targetConfig.component,
            props: {storyId, ...props}
        });

        setCurrentDialogIndex(index);
        showGeneralSetting();
    };

    const closeDialog = (index: number) => {
        dispatch({type: 'removeDialogById', id: SETTINGS_CONFIG[index].id});
    }

    // Open next dialog
    const nextDialog = () => {
        const nextIndex = (currentDialogIndex + 1) % SETTINGS_CONFIG.length;
        openDialog(nextIndex);
    };

    // Open previous dialog
    const previousDialog = () => {
        const prevIndex =
            currentDialogIndex <= 0
                ? SETTINGS_CONFIG.length - 1
                : currentDialogIndex - 1;
        openDialog(prevIndex);
    };

    // Get ID of current dialog
    const currentDialogId =
        currentDialogIndex < SETTINGS_CONFIG.length
            ? SETTINGS_CONFIG[currentDialogIndex].id
            : null;

    // Track open/close dialogs to update state
    useEffect(() => {
        const dialogIds = dialogs.activeDialogs.map(d => d.id);
        const hasSettingsDialogOpen = SETTINGS_DIALOG_IDS.some(id =>
            dialogIds.includes(id)
        );

        if (hasSettingsDialogOpen) {
            // Find open dialog and update index
            const openDialogIndex = SETTINGS_DIALOG_IDS.findIndex(id =>
                dialogIds.includes(id)
            );
            if (openDialogIndex !== -1) {
                setCurrentDialogIndex(openDialogIndex);
            }
            showGeneralSetting();
        } else if (isGeneralSettingVisible) {
            // When no dialog is open but GeneralSetting is visible
            hideGeneralSetting();
        }
    }, [dialogs]);

    const value = {
        isGeneralSettingVisible,
        currentDialogIndex,
        currentDialogId,
        showGeneralSetting,
        hideGeneralSetting,
        openDialog,
        closeDialog,
        openDialogById,
        nextDialog,
        previousDialog,
        settingsConfig: SETTINGS_CONFIG
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

// Hook to use context
export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
