import * as React from "react";
import {EndMenuSettingContext} from "./end-menu-settings-context";
import { CommonSettingField } from "../common";

export const EndMenuSettingField = ({groupName, propName}) => {
	const context = React.useContext(EndMenuSettingContext);

	return (
		<CommonSettingField 
			groupName={groupName}
			propName={propName}
			context={context}
		/>
	);
} 