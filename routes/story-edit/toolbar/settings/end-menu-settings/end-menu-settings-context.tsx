import * as React from "react";
import {TwineGameSetting} from "../../../../../common/twine-game-setting";
import {EndMenuSettingMgr} from "../../../../../common/end-menu-setting-mgr";

export type EndMenuSettingContextType = {
	twineGameSetting: TwineGameSetting,

	changeSettingsByFieldPath: (ev, bundle: {
		groupName: string,
		propertyName: string,
		newValue: any,
		valueUnit: string,
	}) => void;
}

export const EndMenuSettingContext = React.createContext<EndMenuSettingContextType>({
	twineGameSetting: EndMenuSettingMgr.createDefaultSettings(),
	changeSettingsByFieldPath: () => {},
}) 