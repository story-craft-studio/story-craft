import * as React from "react";
import {CDialogSettingField} from "./character-dialog-setting-field";
import {CDialogSettingContext} from "./character-dialog-settings-context";
import { CommonSettingGroup } from "../common";

export const CDialogSettingGroup = ({groupName}) => {
	const context = React.useContext(CDialogSettingContext);

	return (
		<CommonSettingGroup
			groupName={groupName}
			context={context}
			FieldComponent={CDialogSettingField}
		/>
	);
}
