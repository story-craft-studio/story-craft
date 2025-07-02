import * as React from "react";
import { useEffect, useState } from "react";
import PassageCommandMgr from "../../../common/passage-command/PassageCommandMgr";
import {CommandType, PassageCommand} from "../../../common/passage-command/PassageCommandTypeDef";
import { DelayCommandBlock } from "../../../common/passage-command/command-inputs/delay-command-block";
import ChooseNextPassageCommand from "../../../common/passage-command/command-inputs/choose-next-passage/ChooseNextPassageCommand";
import CharacterDialogCommandBlock from "../../../common/passage-command/command-inputs/character/character-dialog-command-block";
import ChangeBackgroundCommandBlock from "../../../common/passage-command/command-inputs/change-background-command/change-background-command-block";
import BackgroundEffectCommandBlock from "../../../common/passage-command/command-inputs/background-effect-command-block";
import { CommandListItemContextType } from "../../../common/passage-command/command-inputs/CommandInputTypeDefs";
import { CommandListItemContext } from "./CommandListItemContext";
import NewCommandBlock from "../../../common/passage-command/command-inputs/new-command-block";
import { Box } from "@mui/material";
import CustomCommandBlock from "../../../common/passage-command/command-inputs/custom-command-block";
import JumpToPassageCommand from "../../../common/passage-command/command-inputs/jump-to-passage-command/jump-to-passage-command";
import CharacterShowCommandBlock
	from "../../../common/passage-command/command-inputs/character/character-show-command-block";
import ClearScreenCommandBlock from "../../../common/passage-command/command-inputs/clear-screen-command-block";
import MusicCommandBlock from "../../../common/passage-command/command-inputs/music-command-block";
import ScriptCommandBlock from "../../../common/passage-command/command-inputs/script-command-block";
import TagCommandBlock from "../../../common/passage-command/command-inputs/tag-command-block";
import _ from "lodash";


export type CommandListItemProps = {
	passage,
	command,
	commandIndex: number,
	positionIndex: number,
	addCmd,
	cloneCmd,
	moveUp, moveDown, moveCommandListItemToIdx,
	textareaId, textareaStyle,
	onChangeText: ( text: string ) => void,
	deleteCmd, changeCommandType, editWholeCommandAtIndex,
	useCodeMirror, otherProps, handleCodeMirrorBeforeChange
}

export const CommandListItem = React.memo((props: CommandListItemProps) => {
	const {
		passage,
		command, commandIndex, positionIndex,
		addCmd,
		cloneCmd,
		moveUp, moveDown, moveCommandListItemToIdx,
		textareaId, textareaStyle,
		onChangeText,
		deleteCmd, changeCommandType, editWholeCommandAtIndex,
		useCodeMirror, otherProps, handleCodeMirrorBeforeChange
	} = props;

	const [commandText, setCommandText] = useState(command?.content?.text || '');
	const [contentInputStyle, setContentInputStyle] = useState(
		PassageCommandMgr.getCommandEditorStyleConfig(command.type)
	);
	const [className, setClassName] = useState(
		PassageCommandMgr.getCommandEditorClassNameConfig(command.type)
	);


	useEffect(() => {
		setCommandText(command?.content?.text || '');
	}, [command, command?.content, command?.content?.text]);


	useEffect(() => {
		setContentInputStyle(PassageCommandMgr.getCommandEditorStyleConfig(command.type));

		let newClassname = PassageCommandMgr.getCommandEditorClassNameConfig(command.type);
		setClassName(newClassname);
	}, [command, command?.type]);


	const onBeforeChange = (editor, data, text) => {
		setCommandText(text);
		handleCodeMirrorBeforeChange(editor, data, text);
	}

	const _onChangeText = (text) => {
		setCommandText(text);
		onChangeText(text);
	}

	const _editWholeCommand = (newCommand: PassageCommand) => {
		editWholeCommandAtIndex(commandIndex, newCommand)
	}

	console.log('RENDERING COMMAND LIST ITEM', command.id, command.type);

	const _commandListItemContext: CommandListItemContextType = {
		passage,

		command,
		commandIndex,
		positionIndex,
		changeCommandType,
		deleteCmd,
		addCmd,
		cloneCmd,
		moveUp, moveDown, moveCommandListItemToIdx,

		commandText,
		useCodeMirror,
		otherProps,
		onBeforeChange,
		textareaId,
		_onChangeText,
		textareaStyle,
		editWholeCommand: _editWholeCommand,
	}

	return (
		<Box className={'command-container'}>
			<CommandListItemContext.Provider value={_commandListItemContext}>
				{
					command.type === CommandType.newCommand
						? <NewCommandBlock />
						: null
				}
				{
					command.type === CommandType.delay
						? <DelayCommandBlock />
						: null
				}
				{
					command.type === CommandType.jumpToPassageWithTag
						? <JumpToPassageCommand />
						: null
				}
				{
					command.type === CommandType.chooseNextPassage
						? <ChooseNextPassageCommand />
						: null
				}

				{
					command.type === CommandType.characterDialog
						? <CharacterDialogCommandBlock />
						: null
				}
				{
					command.type === CommandType.characterShow
						? <CharacterShowCommandBlock />
						: null
				}
				{/* {
					command.type === CommandType.characterHide
						? <CharacterHideCommandInput />
						: null
				} */}

				{
					command.type === CommandType.customCommand
						? <CustomCommandBlock />
						: null
				}
				{
					command.type === CommandType.changeBackground
						? <ChangeBackgroundCommandBlock />
						: null
				}
				{
					command.type === CommandType.backgroundEffect
						? <BackgroundEffectCommandBlock />
						: null
				}
				{
					command.type === CommandType.clearScreen
						? <ClearScreenCommandBlock />
						: null
				}
				{
					command.type === CommandType.playMusic
						? <MusicCommandBlock />
						: null
				}
				{
					command.type === CommandType.script
						? <ScriptCommandBlock />
						: null
				}
				{/* {
					command.type === CommandType.tag
						? <TagCommandBlock />
						: null
				} */}
			</CommandListItemContext.Provider>
		</Box>
	)
}, (prevProps, nextProps) => {
	// if (prevProps.passage.commands.length !== nextProps.passage.commands.length) {
	// 	return false;
	// }

	if (prevProps.commandIndex !== nextProps.commandIndex) {
		return false;
	}

	if (prevProps.positionIndex !== nextProps.positionIndex) {
		return false;
	}

	if (prevProps.command.type !== nextProps.command.type) {
		return false;
	}

	if (prevProps.command.id !== nextProps.command.id) {
		return false;
	}

    if (!_.isEqual(prevProps.command, nextProps.command)) {
		return false;
	}

	return true
});
