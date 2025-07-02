import { Story } from "../store/stories/stories.types";
import { TwineGameSetting } from "./twine-game-setting";

export class StartMenuSettingMgr {
	static createDefaultSettings(story?: Story) {
		let s = new TwineGameSetting();

		s.createGroup('titleSettings')
			.setGroupDisplayTitle('dialogs.storySettings.group.startMenu.titleSettings')
			.setGroupDisplayDescription('dialogs.storySettings.group.startMenu.titleSettingsDesc')
			.addProperty('menuTitleText', {
				_title: 'dialogs.storySettings.group.startMenu.menuTitleText',
				initialValue: story?.storySetting?.startMenuSetting?.menuTitleText?.value || story?.name || '',
				inputType: "text",
				_tooltip: 'dialogs.storySettings.group.startMenu.menuTitleTextTooltip'
			})
			.addProperty('titleTextColor', {
				_title: 'dialogs.storySettings.group.startMenu.titleTextColor',
				initialValue: '#ffffff',
				inputType: "color",
			})
			.addProperty('titleFontSize', {
				_title: 'dialogs.storySettings.group.startMenu.fontSizeDesc',
				initialValue: 48,
				inputType: "number",
				// unitsToChooseFrom: ['rem', 'px'],
			});

		s.createGroup('backgroundGrup')
			.setGroupDisplayTitle('dialogs.storySettings.group.startMenu.background')
			.setGroupDisplayDescription('dialogs.storySettings.group.startMenu.backgroundDesc')
			.addProperty('backgroundColorOrImage', {
				_title: 'dialogs.storySettings.group.startMenu.backgroundDesc',
				initialValue: '',
				inputType: "link",
				assetType: "image",
			})

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
