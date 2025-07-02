import {PassageCommand} from "../PassageCommandTypeDef";
import * as React from "react";
import {Passage} from "../../../store/stories";
import {CommandListItemContext} from "../../../components/control/passage-command-area/CommandListItemContext";
import {CommandType} from "../../../../shared/typedef/command-type";

export type CommandListItemContextType = {
	passage: Passage,

	command: PassageCommand,
	commandIndex: number,
	positionIndex: number,
	changeCommandType: (i: number, cmdType: CommandType) => void,
	deleteCmd: (i) => void,

	addCmd: Function,
	cloneCmd: Function,
	moveUp: Function,
	moveDown: Function,
	moveCommandListItemToIdx: (to: number, from: number) => void,

	commandText: string,
	useCodeMirror: boolean,
	otherProps: any,
	onBeforeChange: (editor, data, text) => void,
	textareaId: string,
	_onChangeText: (ev) => void,
	textareaStyle?: React.CSSProperties,
	editWholeCommand: (cmd: PassageCommand) => void,
}
