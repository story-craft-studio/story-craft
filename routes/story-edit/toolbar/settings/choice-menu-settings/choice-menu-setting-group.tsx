import * as React from "react";
import { ChoiceMenuSettingContext } from "./choice-menu-settings-context";
import { ChoiceMenuSettingField } from "./choice-menu-setting-field";
import { CommonSettingGroup } from "../common";

export function ChoiceMenuSettingGroup({ groupName }) {
	const context = React.useContext(ChoiceMenuSettingContext);

	return (
		<CommonSettingGroup
			groupName={groupName}
			context={context}
			FieldComponent={ChoiceMenuSettingField}
		/>
	);
} 