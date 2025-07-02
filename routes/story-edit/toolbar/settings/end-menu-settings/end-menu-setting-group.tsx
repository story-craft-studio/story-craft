import * as React from "react";
import {EndMenuSettingContext} from "./end-menu-settings-context";
import {EndMenuSettingField} from "./end-menu-setting-field";
import { CommonSettingGroup } from "../common";

export interface EndMenuSettingGroupProps {
	groupName: string;
}

export const EndMenuSettingGroup: React.FC<EndMenuSettingGroupProps> = ({
	groupName,
}) => {
	const context = React.useContext(EndMenuSettingContext);

	return (
		<CommonSettingGroup
			groupName={groupName}
			context={context}
			FieldComponent={EndMenuSettingField}
		/>
	);
} 