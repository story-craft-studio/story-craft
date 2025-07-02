import * as React from 'react';
import {ButtonBar} from '../../../../components/container/button-bar';
import {Story, updateStory, useStoriesContext} from '../../../../store/stories';
import {ActionDialogId, useDialogsContext} from "../../../../dialogs";
import {useTranslation} from "react-i18next";
import {IconButton} from "../../../../components/control/icon-button";
import {IconMessageCircle, IconUser} from "@tabler/icons";
import CharacterSettings from "./character-settings/character-settings";
import {RenameStoryButton} from '../../../../components/story/rename-story-button';
import {useSettings} from './settings-context';

export interface SettingActionsProps {
    story: Story,
    stories: Story[],
}

export const SettingActionsContent: React.FC<SettingActionsProps> = props => {
    const {story} = props;
    const {dispatch} = useDialogsContext();
    const {dispatch: storyDispatch, stories} = useStoriesContext();
    const {t} = useTranslation();

    const {showGeneralSetting, hideGeneralSetting} = useSettings();

    const openCharacterSettings = () => {
        hideGeneralSetting();

        closeCharacterSettings();

        // Mở Character Settings dialog
        dispatch({
            type: 'addDialog',
            component: CharacterSettings,
            id: 'CharacterSettings' as ActionDialogId,
            props: {storyId: story.id}
        });
    };

	const closeCharacterSettings = () => {
		dispatch({
			type: 'removeDialogById',
			id: 'CharacterSettings' as ActionDialogId,
		});
	}

    return (
        <>
            <ButtonBar>
                <RenameStoryButton
                    existingStories={stories}
                    onRename={name => storyDispatch(updateStory(stories, story, {name}))}
                    story={story}
                />
                <IconButton
                    icon={<IconMessageCircle/>}
                    label={t('routes.storyEdit.toolbar.general')}
                    onClick={showGeneralSetting}
                />
                <IconButton
                    icon={<IconUser/>}
                    label={t('routes.storyEdit.toolbar.character')}
                    onClick={openCharacterSettings}
                />
            </ButtonBar>
        </>
    );
};

// Wrap component với SettingsProvider
export const SettingActions: React.FC<SettingActionsProps> = props => {
    return (
        <SettingActionsContent {...props} />
    );
};