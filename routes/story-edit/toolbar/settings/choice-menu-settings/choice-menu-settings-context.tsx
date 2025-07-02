import * as React from "react";
import { TwineGameSetting } from "../../../../../common/twine-game-setting";
import { ChoiceMenuSettingMgr } from "../../../../../common/choice-menu-setting-mgr";

export type ChoiceMenuSettingContextValue = {
	twineGameSetting: TwineGameSetting,

	changeSettingsByFieldPath: (ev, bundle: {
		groupName: string,
		propertyName: string,
		newValue: any,
		valueUnit: string,
	}) => void;
}

export const ChoiceMenuSettingContext = React.createContext<ChoiceMenuSettingContextValue>({
    twineGameSetting: ChoiceMenuSettingMgr.createDefaultSettings(),
	changeSettingsByFieldPath: () => {},
}); 