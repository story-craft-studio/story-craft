import { CommandListItemContext } from "./CommandListItemContext";
import { CommandBlockTitle, NavigatorBlock } from "../../../common/passage-command/command-blocks/base-ui";
import React from "react";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
	AddCommandButton,
	CloneCommandButton,
	IconButton,
	MoveDownButton,
	MoveUpButton,
	RemoveButton
} from "../../../common/passage-command/command-blocks/base-ui-buttons";
import { CommandTypeSelector } from "./command-type-selector/command-type-selector";
import { getCommandTypeIcon } from "../../../common/passage-command/command-blocks/command-type-icons";
import { Box, Tooltip, tooltipClasses, styled, TooltipProps } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useComponentTranslation } from "../../../util/translation-wrapper";

const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
	<Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
	[`& .${tooltipClasses.tooltip}`]: {
		backgroundColor: '#000000',
		color: 'rgba(255, 255, 255, 0.87)',
		maxWidth: 300,
		fontSize: theme.typography.pxToRem(14),
		padding: '12px 16px',
		border: '1px solid #dadde9',
		borderRadius: '10px',
		boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
	},
	[`& .${tooltipClasses.arrow}`]: {
		color: '#000000',
	},
}));

export default function CommandNavigators() {
	const context = React.useContext(CommandListItemContext);
	const { t } = useComponentTranslation('commandTypeSelector');

	return (
		<Box
			className={'CommandNavigators'}
			sx={{
				position: "absolute",
				width: "100%",
				height: "100%",
				top: -4,
				left: -4,
				display: "flex",
				flexDirection: "column",
				gap: 1
			}}
		>
			<Box sx={{
				display: "flex",
				alignItems: "center",
				gap: 1,
				position: "absolute",
				top: 0,
				left: 0,
				zIndex: 1
			}}>
				<StyledTooltip
					title={t(context?.command?.type || "")}
					placement="top"
					arrow
				>
					<CommandBlockTitle commandType={context?.command.type}>
						{context?.command.type && (
							<Box sx={{ 
								filter: 'drop-shadow(2px 2px 0px rgba(18, 12, 65, 0.322))',
								display: 'flex',
								transform: 'scale(1.2)'
							}}>
								{getCommandTypeIcon(context.command.type)}
							</Box>
						)}
					</CommandBlockTitle>
				</StyledTooltip>
			</Box>

			<Box sx={{
				position: "absolute",
				top: -25,
				right: -30,
				zIndex: 1
			}}>
				<NavigatorBlock className="command-body-hover-visible">
					<AddCommandButton
						onPointerDown={() => context?.addCmd(context?.commandIndex)}
					/>
					<CloneCommandButton
						onPointerDown={() => context?.cloneCmd(context?.commandIndex)}
					/>
					<RemoveButton
						onPointerDown={() => context?.deleteCmd(context?.commandIndex)}
					/>
				</NavigatorBlock>
			</Box>
		</Box>
	)
}

