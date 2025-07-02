import {useTranslation} from "react-i18next";
import * as React from "react";
import { ChoiceMenuSettingContext } from "./choice-menu-settings-context";
import { CommonSettingField } from "../common";

// Function to check if the field is disabled
const checkDisabled = (groupName: string, propName: string, twineGameSetting: any): boolean => {
	// Title background color is disabled when title background image is set
	if (propName === 'choiceBackgroundColor' && groupName === 'choiceSettings') {
		const choiceBackgroundImage = twineGameSetting.getPropertyValue('choiceSettings', 'choiceBackgroundImage');
		return !!choiceBackgroundImage;
	}
	
	return false;
};

const createDisabledMessageGetter = (t: any) => (propName: string): string => {
	if (propName === 'choiceBackgroundColor') {
		return t('dialogs.storySettings.disabledByImage', 'This setting is disabled because you have set a background image. Remove the background image to use this setting.');
	}
	return '';
};


export const ChoiceMenuSettingField = ({ groupName, propName }) => {
	const context = React.useContext(ChoiceMenuSettingContext);
	const {t} = useTranslation(); 
	const getDisabledMessage = React.useMemo(() => createDisabledMessageGetter(t), [t]);

	return <CommonSettingField 
		groupName={groupName}
		propName={propName} 
		context={context}
		disabledCheck={checkDisabled}
		getDisabledMessage={getDisabledMessage}
		supportsPositionInput={true}
	/>;
} 