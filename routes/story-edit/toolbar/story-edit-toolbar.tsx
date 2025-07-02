import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { RouteToolbar } from '../../../components/route-toolbar';
import { AppActions, BuildActions } from '../../../route-actions';
import { Story } from '../../../store/stories';
import { Point } from '../../../util/geometry';
import { PassageActions } from './passage/passage-actions';
import { StoryActions } from './story/story-actions';
import { UndoRedoButtons } from './undo-redo-buttons';
import { ZoomButtons } from './zoom-buttons';
import { SettingActions } from "./settings/setting-actions";
import { SettingsProvider } from "./settings/settings-context";
import { AssetToolbar } from "../../../asset/toolbar/asset-toolbar";
import AppConfig from "../../../app-config";
import { defaultSettings, usePrefsContext } from '../../../store/prefs';

export interface StoryEditToolbarProps {
	getCenter: () => Point;
	onOpenFuzzyFinder: () => void;
	story: Story;
	stories: Story[],
}

export const StoryEditToolbar: React.FC<StoryEditToolbarProps> = props => {
	const { getCenter, onOpenFuzzyFinder, story, stories } = props;
	const { prefs } = usePrefsContext();
	const { t } = useTranslation();

	const SettingTabs = {
		[t('common.passage')]: (
			<PassageActions
				getCenter={getCenter}
				onOpenFuzzyFinder={onOpenFuzzyFinder}
				story={story}
				stories={stories}
			/>
		),
		[t('common.asset')]: <AssetToolbar />,
		[t('common.settings')]: (
			<SettingsProvider storyId={story.id}>
				<SettingActions story={story} stories={stories}/>
			</SettingsProvider>
		),
	}

	if(AppConfig.isDev()) {
		SettingTabs[t('common.appName')] = <AppActions />;
		SettingTabs[t('common.build')] = <BuildActions story={story} />;
		SettingTabs[t('common.story')] = <StoryActions story={story} stories={stories}/>;
	}

	return defaultSettings.showStoryListToolbar ? (
		<RouteToolbar
			pinnedControls={
				<></>
			}
			tabs={SettingTabs}
			story={story}
		/>
	) : null;
};
