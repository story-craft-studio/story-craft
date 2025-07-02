import {useTranslation} from "react-i18next";
import * as React from "react";
import {CDialogSettingContext} from "./character-dialog-settings-context";
import { CommonSettingField } from "../common";

// Function to check if the field is disabled
const checkDisabled = (groupName: string, propName: string, twineGameSetting: any): boolean => {
	// Title background color is disabled when title background image is set
	if (propName === 'titleBackgroundColor' && groupName === 'background') {
		const titleBackgroundImage = twineGameSetting.getPropertyValue('background', 'titleBackgroundImage');
		return !!titleBackgroundImage;
	}
	
	// Dialog background color is disabled when dialog background image is set
	if (propName === 'dialogBackgroundColor' && groupName === 'background') {
		const dialogBackgroundImage = twineGameSetting.getPropertyValue('background', 'dialogBackgroundImage');
		return !!dialogBackgroundImage;
	}
	
	return false;
};

const createDisabledMessageGetter = (t: any) => (propName: string): string => {
	if (propName === 'titleBackgroundColor' || propName === 'dialogBackgroundColor') {
		return t('dialogs.storySettings.disabledByImage', 'This setting is disabled because you have set a background image. Remove the background image to use this setting.');
	}
	return '';
};

export const CDialogSettingField = ({groupName, propName}) => {
	const context = React.useContext(CDialogSettingContext);
	const {t} = useTranslation(); 
	const getDisabledMessage = React.useMemo(() => createDisabledMessageGetter(t), [t]);

	return (
		<CommonSettingField 
			groupName={groupName}
			propName={propName}
			context={context}
			disabledCheck={checkDisabled}
			getDisabledMessage={getDisabledMessage}
			supportsPositionInput={true}
		/>
	);
}
