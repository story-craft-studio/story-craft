import * as React from "react";
import { CommandListItemContext } from "../../../components/control/passage-command-area/CommandListItemContext";
import {
	BodyTheme,
	CommandBlockBody,
	CommandBlockHolder,
} from "../command-blocks/base-ui";
import { CommandType } from "../PassageCommandTypeDef";
import { CommandTypeButtons } from "../command-blocks/command-type-buttons";
import CommandNavigators from "../../../components/control/passage-command-area/CommandNavigators";
import { useUndoableStoriesContext } from "../../../store/undoable-stories";

export default function NewCommandBlock() {
	const context = React.useContext(CommandListItemContext);
	const { dispatch } = useUndoableStoriesContext();

	const handleCommandSelect = (commandType: CommandType) => {
		if (context?.changeCommandType) {
			context.changeCommandType(context.commandIndex, commandType);
		}
	};

	return (
		<CommandBlockHolder commandType={CommandType.newCommand} style={{ height: '100%' }}>
			<CommandNavigators />
			<CommandBlockBody $variant="NORMAL" style={{ marginBottom: 10 }}>
				<CommandTypeButtons 
					onCommandSelect={handleCommandSelect} 
					passage={context?.passage}
					dispatch={dispatch}
				/>
			</CommandBlockBody>
		</CommandBlockHolder>
	);
}
