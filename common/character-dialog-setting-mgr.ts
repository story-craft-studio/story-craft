import {TwineGameSetting} from "./twine-game-setting";

export class CharacterDialogSettingMgr {
	static createDefaultSettings() {
		let s = new TwineGameSetting();

		s.createGroup('background')
			.setGroupDisplayTitle('dialogs.storySettings.group.characterDialog.background')
			.setGroupDisplayDescription('dialogs.storySettings.group.characterDialog.backgroundDesc')
			.addProperty('titleBackgroundImage', {
				_title: 'dialogs.storySettings.group.characterDialog.titleBackground',
				_tooltip: 'dialogs.storySettings.group.characterDialog.titleBackgroundTooltip',
				initialValue: '',
				inputType: "link",
				assetType: "image",
			})
			.addProperty('titleBackgroundColor', {
				_title: 'dialogs.storySettings.group.characterDialog.titleBackgroundColor',
				_tooltip: 'dialogs.storySettings.group.characterDialog.titleBackgroundColorTooltip',
				initialValue: '#eaad8a',
				inputType: "color",
			})
			.addProperty('dialogBackgroundImage', {
				_title: 'dialogs.storySettings.group.characterDialog.dialogBackground',
				_tooltip: 'dialogs.storySettings.group.characterDialog.dialogBackgroundTooltip',
				initialValue: '',
				inputType: "link",
				assetType: "image",
			})
			.addProperty('dialogBackgroundColor', {
				_title: 'dialogs.storySettings.group.characterDialog.dialogBackgroundColor',
				_tooltip: 'dialogs.storySettings.group.characterDialog.dialogBackgroundColorTooltip',
				initialValue: '#000',
				inputType: "color",
			})

		s.createGroup('fontSize')
			.setGroupDisplayTitle('dialogs.storySettings.group.characterDialog.fontSize')
			.setGroupDisplayDescription('dialogs.storySettings.group.characterDialog.fontSizeDesc')
			.addProperty('titleFontSize', {
				_title: 'dialogs.storySettings.group.characterDialog.titleFontSize',
				_tooltip: 'dialogs.storySettings.group.characterDialog.titleFontSizeTooltip',
				initialValue: 25,
				inputType: "number",
				// unitsToChooseFrom: ['rem', 'px'],
			})
			.addProperty('dialogFontSize', {
				_title: 'dialogs.storySettings.group.characterDialog.dialogFontSize',
				_tooltip: 'dialogs.storySettings.group.characterDialog.dialogFontSizeTooltip',
				initialValue: 25,
				inputType: "number",
				// unitsToChooseFrom: ['rem', 'px'],
			})
			.addProperty('dialogSize', {
				_title: 'dialogs.storySettings.group.characterDialog.dialogAreaSize',
				_tooltip: 'dialogs.storySettings.group.characterDialog.dialogAreaSizeTooltip',
				initialValue: 80,
				inputType: "slider",
				min: 50,
				max: 100,
				step: 10,
			})
			.addProperty('dialogPosition', {
				_title: 'dialogs.storySettings.group.characterDialog.dialogPosition',
				_tooltip: 'dialogs.storySettings.group.characterDialog.dialogPositionTooltip',
				initialValue: { x: 0, y: 0 },
				inputType: "position",
				min: -200,
				max: 200,
				step: 10
			})

		s.createGroup('textColor')
			.setGroupDisplayTitle('dialogs.storySettings.group.characterDialog.textColor')
			.setGroupDisplayDescription('dialogs.storySettings.group.characterDialog.textColorDesc')
			.addProperty('titleTextColor', {
				_title: 'dialogs.storySettings.group.characterDialog.titleTextColor',
				_tooltip: 'dialogs.storySettings.group.characterDialog.titleTextColorTooltip',
				initialValue: '#000',
				inputType: "color",
			})
			.addProperty('dialogTextColor', {
				_title: 'dialogs.storySettings.group.characterDialog.dialogTextColor',
				_tooltip: 'dialogs.storySettings.group.characterDialog.dialogTextColorTooltip',
				initialValue: '#fff',
				inputType: "color",
			})
		
		/* DEV EXAMPLE ONLY
		s.createGroup('UsageExample')
			.setGroupDisplayTitle('trivia.usageExample.title')
			.setGroupDisplayDescription('trivia.usageExample.desc')
			.addProperty('aNumber', {
				_title: 'trivia.usageExample.aNumber',
				_tooltip: 'trivia.usageExample.aNumberDesc',
				initialValue: 123,
				inputType: "number",
			})
			.addProperty('aBoolean', {
				_title: 'trivia.usageExample.aBoolean',
				_tooltip: 'trivia.usageExample.aBooleanDesc',
				initialValue: true,
				inputType: "checkbox",
			})
			.addProperty('aText', {
				_title: 'trivia.usageExample.aText',
				_tooltip: 'trivia.usageExample.aTextDesc',
				initialValue: 123,
				inputType: "text",
			})
			.addProperty('aSlider', {
				_title: 'trivia.usageExample.aSlider',
				_tooltip: 'trivia.usageExample.aSliderDesc',
				initialValue: 450,
				inputType: "slider",
				min: 80,
				max: 600,
			})
		*/

		return s;
	}

	static fromRawObj(rawCharacterDialogSetting: any) {
		let otherSetting = TwineGameSetting.fromRawObj(rawCharacterDialogSetting);
		let newDefaultSetting = this.createDefaultSettings();

		//why ? => to ensure all setting objects being display always have every newly added setting groups & properties..
		//..avoid case where u have to clean old stored setting in order for new one to be used
		newDefaultSetting.beOverriddenBy(otherSetting);
		return newDefaultSetting;
	}
}

export type OneOfInputType = 'checkbox' | 'text' | 'number' | 'slider' | 'color' | 'link' | 'position';
