import { Story } from "../store/stories/stories.types";
import { TwineGameSetting } from "./twine-game-setting";

export class EndMenuSettingMgr {
	static createDefaultSettings(story?: Story) {
		let s = new TwineGameSetting();

		s.createGroup('titleSettings')
			.setGroupDisplayTitle('dialogs.storySettings.group.endMenu.titleSettings')
			.setGroupDisplayDescription('dialogs.storySettings.group.endMenu.titleSettingsDesc')
			.addProperty('menuTitleText', {
				_title: 'dialogs.storySettings.group.endMenu.menuTitleText',
				initialValue: 'Game Over',
				inputType: "text",
				_tooltip: 'dialogs.storySettings.group.endMenu.menuTitleTextTooltip'
			})
			.addProperty('titleTextColor', {
				_title: 'dialogs.storySettings.group.endMenu.titleTextColor',
				initialValue: '#ffffff',
				inputType: "color",
			})
			.addProperty('titleFontSize', {
				_title: 'dialogs.storySettings.group.endMenu.fontSizeDesc',
				initialValue: 36,
				inputType: "number",
			});

		s.createGroup('backgroundGrup')
			.setGroupDisplayTitle('dialogs.storySettings.group.endMenu.background')
			.setGroupDisplayDescription('dialogs.storySettings.group.endMenu.backgroundDesc')
			.addProperty('backgroundColorOrImage', {
				_title: 'dialogs.storySettings.group.endMenu.backgroundImage',
				initialValue: '',
				inputType: "link",
				assetType: "image",
			});

		return s;
	}

	static fromRawObj(rawSetting: any, story?: Story) {
		let otherSetting = TwineGameSetting.fromRawObj(rawSetting);
		let newDefaultSetting = this.createDefaultSettings(story);

		//ensure all setting objects being display always have every newly added setting groups & properties..
		newDefaultSetting.beOverriddenBy(otherSetting);

		return newDefaultSetting;
	}
} 