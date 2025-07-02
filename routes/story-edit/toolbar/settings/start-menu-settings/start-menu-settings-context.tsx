import * as React from "react";
import {TwineGameSetting} from "../../../../../common/twine-game-setting";
import {StartMenuSettingMgr} from "../../../../../common/start-menu-setting-mgr";

export type StartMenuSettingContextType = {

	twineGameSetting: TwineGameSetting,

	changeSettingsByFieldPath: (ev, bundle: {
		groupName: string,
		propertyName: string,
		newValue: any,
		valueUnit: string,
	}) => void;
}

export const StartMenuSettingContext = React.createContext<StartMenuSettingContextType>({
	twineGameSetting: StartMenuSettingMgr.createDefaultSettings(),
	changeSettingsByFieldPath: () => {},
})
