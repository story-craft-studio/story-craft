import * as React from "react";
import {StartMenuSettingContext} from "./start-menu-settings-context";
import {StartMenuSettingField} from "./start-menu-setting-field";
import { CommonSettingGroup } from "../common";

export const StartMenuSettingGroup = ({groupName}) => {
	const context = React.useContext(StartMenuSettingContext);

	return (
		<CommonSettingGroup
			groupName={groupName}
			context={context}
			FieldComponent={StartMenuSettingField}
		/>
	);
}
