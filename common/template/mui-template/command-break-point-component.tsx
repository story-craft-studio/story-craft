import React, {HTMLAttributes, useState} from "react";
import SellIcon from "@mui/icons-material/Sell";
import {
	EditButton,
	MoveDownButton,
	MoveUpButton,
	RemoveButton
} from "../../passage-command/command-blocks/base-ui-buttons";
import {commandColors, InputField, NavigatorBlock, theme} from "../../passage-command/command-blocks/base-ui";
import * as MuiSystem from "@mui/system";
import {Box} from "@mui/material";
import _ from "lodash";
import { CommandType } from "../../passage-command/PassageCommandTypeDef";


export const CommandBreakPointContainer = MuiSystem.styled(Box, {
	// forwarded all prop(s) to DOM
	shouldForwardProp: (prop) => true,
})((props) => ({
	display: 'flex',
	alignItems: 'center',
	border: '1px solid #ccc',
	borderRadius: '12px',
	padding: '8px',
	paddingLeft: '5px',
	background: `${commandColors[CommandType.tag]}`,
	fontWeight: 'bold',
	width: '100%',
	gap: '10px',
	color: `${theme.tagColor}`,
	position: 'relative',
}));

type CommandBreakPointComponentProps = {
	bgColor?,
	editable?,
	collapsible?,
	value: string | undefined,
	onChange,
	onMoveUp?,
	onMoveDown?,
	onRemove
}

export const CommandBreakPointComponent = (props: HTMLAttributes<any> & CommandBreakPointComponentProps) => {
	const [collapsed, setCollapsed] = useState(false);

	const [editMode, setEditMode] = useState(false);
	const [tagName, setTagName] = useState(props.value || "My Empty Tag");

	let htmlAttributesProps = {...props};
	delete htmlAttributesProps.bgColor;
	delete htmlAttributesProps.editable;
	delete htmlAttributesProps.collapsible;
	delete htmlAttributesProps.value;
	delete htmlAttributesProps.onChange;
	delete htmlAttributesProps.onMoveUp;
	delete htmlAttributesProps.onMoveDown;
	delete htmlAttributesProps.onRemove;

	return (
		<CommandBreakPointContainer
			className='CommandBreakPointContainer'
			sx={{
				marginTop: '20px',
				'&:hover': {
					'& .hover': {
						display: 'flex',
					}
				},
			}}
			{...htmlAttributesProps}
		>
			<SellIcon
				sx={{
					color: theme.tagColor
				}}
			/>
			{editMode ? null : tagName}

			{editMode
				? (<InputField
					title="Tag Name"
					value={tagName}
					onChange={(ev) => {
						setTagName(ev.target.value);
						props.onChange(ev);
					}}
					onBlur={(ev) => {
						setEditMode(!editMode);
					}}
				/>)
				: null
			}
			<NavigatorBlock className="hover" style={{ top: '-10px' }}>
				{
					props.editable
						? <EditButton
							onPointerDown={() => {
								setEditMode(!editMode)
							}}
						/>
						: null
				}
				{
					props.collapsible
						? <RemoveButton
							onPointerDown={(ev) => {
								setCollapsed(!collapsed);
								props.onRemove(ev);
							}}
						/>
						: null
				}
			</NavigatorBlock>
		</CommandBreakPointContainer>
	);
};
