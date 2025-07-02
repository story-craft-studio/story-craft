import { Story } from "../store/stories/stories.types";
import { TwineGameSetting } from "./twine-game-setting";

export class ChoiceMenuSettingMgr {
	static createDefaultSettings(story?: Story) {
		let s = new TwineGameSetting();

		s.createGroup('titleSettings')
			.setGroupDisplayTitle('dialogs.storySettings.group.choiceMenu.titleSettings')
			.setGroupDisplayDescription('dialogs.storySettings.group.choiceMenu.titleSettingsDesc')
			.addProperty('titleTextColor', {
				_title: 'dialogs.storySettings.group.choiceMenu.titleTextColor',
				initialValue: '#ffffff',
				inputType: "color",
			})
			.addProperty('titleFontSize', {
				_title: 'dialogs.storySettings.group.choiceMenu.fontSizeDesc',
				initialValue: 48,
				inputType: "number",
				// unitsToChooseFrom: ['rem', 'px'],
			});

		s.createGroup('backgroundGrup')
			.setGroupDisplayTitle('dialogs.storySettings.group.choiceMenu.background')
			.setGroupDisplayDescription('dialogs.storySettings.group.choiceMenu.backgroundDesc')
			.addProperty('backgroundColorOrImage', {
				_title: 'dialogs.storySettings.group.choiceMenu.backgroundDesc',
				initialValue: '',
				inputType: "link",
				assetType: "image",
			});

		s.createGroup('choiceSettings')
			.setGroupDisplayTitle('dialogs.storySettings.group.choiceMenu.choiceSettings')
			.setGroupDisplayDescription('dialogs.storySettings.group.choiceMenu.choiceSettingsDesc')
			.addProperty('choiceTextColor', {
				_title: 'dialogs.storySettings.group.choiceMenu.choiceTextColor',
				initialValue: '#ffffff',
				inputType: "color",
			})
			.addProperty('choiceFontSize', {
				_title: 'dialogs.storySettings.group.choiceMenu.fontSizeDesc',
				initialValue: 36,
				inputType: "number",
				// unitsToChooseFrom: ['rem', 'px'],
			})
			.addProperty('choiceTextColor', {
				_title: 'dialogs.storySettings.group.choiceMenu.choiceTextColor',
				initialValue: '#000000',
				inputType: "color",
			})
			.addProperty('choiceBackgroundImage', {
				_title: 'dialogs.storySettings.group.choiceMenu.choiceBackgroundImage',
				initialValue: '',
				inputType: "link",
				assetType: "image",
			})
			.addProperty('choiceBackgroundColor', {
				_title: 'dialogs.storySettings.group.choiceMenu.choiceBackgroundColor',
				initialValue: '#000000',
				inputType: "color",
			})
			.addProperty('choicePosition', {
				_title: 'dialogs.storySettings.group.choiceMenu.choicePosition',
				_tooltip: 'dialogs.storySettings.group.choiceMenu.choicePositionTooltip',
				initialValue: { x: 0, y: 0 },
				inputType: "position",
				min: -200,
				max: 200,
				step: 10
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