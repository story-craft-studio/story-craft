import * as React from "react";
import {TwineGameSetting} from "../../../../../common/twine-game-setting";
import {CharacterDialogSettingMgr} from "../../../../../common/character-dialog-setting-mgr";

export type CDialogSettingContextType = {

	twineGameSetting: TwineGameSetting,

	changeSettingsByFieldPath: (ev, bundle: {
		groupName: string,
		propertyName: string,
		newValue: any,
		valueUnit: string,
	}) => void;

}

export const CDialogSettingContext = React.createContext<CDialogSettingContextType>({
	twineGameSetting: CharacterDialogSettingMgr.createDefaultSettings(),
	changeSettingsByFieldPath: () => {},
})
