import * as React from "react";
import {StartMenuSettingContext} from "./start-menu-settings-context";
import { CommonSettingField } from "../common";

export const StartMenuSettingField = ({groupName, propName}) => {
	const context = React.useContext(StartMenuSettingContext);

	return (
		<CommonSettingField 
			groupName={groupName}
			propName={propName}
			context={context}
		/>
	);
}
