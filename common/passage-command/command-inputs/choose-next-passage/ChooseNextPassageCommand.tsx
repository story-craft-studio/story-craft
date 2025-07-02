import { CommandListItemContextType } from "../CommandInputTypeDefs";
import * as React from "react";
import { useEffect, useState } from "react";
import { PassageCommand } from "../../PassageCommandTypeDef";
import StringUtil from "../../../../util/StringUtil";
import './ChooseNextPassageCommand.css';
import parse from 'html-react-parser';
import { PassageEditContext } from "../../../../dialogs/context/passage-edit-context";
import { CommandListItemContext } from "../../../../components/control/passage-command-area/CommandListItemContext";
import { Alert, Box, Button, Divider } from "@mui/material";
import CommandNavigators from "../../../../components/control/passage-command-area/CommandNavigators";
import { useComponentTranslation, useErrorMessageTranslation } from "../../../../util/translation-wrapper";
import { NextPassageDescReactComp } from "./next-passage-desc-react-comp";
import { NextPassageDesc, TargetPassageBy} from "../../../../../shared/typedef/ChooseNextPassageCommandTypeDef";
import DelayTaskUtil from "../../../../util/DelayTaskUtil";
import {
	CommandBlockBody,
	CommandBlockHolder,
	CommandBlockScope,
	InputField
} from "../../command-blocks/base-ui";

function genElementId(_commandListItemContext?: CommandListItemContextType) {
	if (!_commandListItemContext) {
		console.error('NO FREAKING WAY!! COME TAKE A LOOK AT THIS SHIT MAN..');
		return `pid-${StringUtil.randomString()}-ChooseNextPassageCommandInput-command-${StringUtil.randomString()}`;
	}
	let rand = StringUtil.randomString();
	return `${rand}-pid-${_commandListItemContext.passage.id}-${_commandListItemContext.commandIndex}`;
}

export default function ChooseNextPassageCommand() {
	const _passageEditContext = React.useContext(PassageEditContext);
	const { passage, allPassages } = _passageEditContext;

	const { tComp } = useComponentTranslation('chooseNextPassageCommandInput');
	const { tError } = useErrorMessageTranslation();
	const context = React.useContext(CommandListItemContext);

	const [elementIdx, setElementIdx] = useState(genElementId(context));
	const [promptTitle, setPromptTitle] = useState(context?.command?.content?.chooseNextPassageParam?.promptTitle);
	const [nextPassages, setNextPassages] = useState<NextPassageDesc[] | undefined>(context?.command?.content?.chooseNextPassageParam?.nextPassages);
	const [commandContentText, setCommandContentText] = useState(context?.command?.content?.text);
	const [errObj, setErrObj] = useState<any>(undefined);

	const onClickAlertMsg = (ev) => {
		if (errObj?.type === 'NOT_AT_LAST_INDEX') {
			context?.moveCommandListItemToIdx(passage.commands.length - 1, context?.commandIndex);
			return;
		}
	}

	useEffect(() => {
		let commands = passage.commands;

		// @ts-ignore
		let isLast = context?.commandIndex >= commands?.length - 1;
		/* Pending this feature
		if (!isLast) {
			console.warn('ChooseNextPassage command must be last in the commands order, current order is ', context?.commandIndex, 'expect to be ', commands?.length - 1);
			setErrObj({
				type: 'NOT_AT_LAST_INDEX',
				errMessageKey: 'chooseNextPassageNotAtLast',
			})
			return;
		}
		*/
		setErrObj(undefined);
	}, [context?.commandIndex, passage]);

	useEffect(() => {
		setNextPassages(context?.command?.content?.chooseNextPassageParam?.nextPassages);
	}, [context?.command?.content?.chooseNextPassageParam?.nextPassages]);


	const _setPromptTitle = (ev) => {
		setPromptTitle(ev.target.value);

		DelayTaskUtil.reInvokeDelayTask(elementIdx + '-setPromptTitle', () => {
			let cmd = { ...context?.command } as PassageCommand;
			if (!cmd.content) cmd.content = {};
			if (!cmd.content.chooseNextPassageParam) cmd.content.chooseNextPassageParam = {};
			cmd.content.chooseNextPassageParam.promptTitle = ev.target.value;
			context?.editWholeCommand(cmd);
		})
	}

	const addNextPassage = (ev) => {
		let newPassageDesc: NextPassageDesc = {
			id: '',
			text: allPassages[0].name,
			promptText: '',
			targetBy: TargetPassageBy.name,
		}

		let newNextPassages: NextPassageDesc[] = [];
		if (nextPassages?.length) {
			newNextPassages.push(...nextPassages);
		}
		newNextPassages.push(newPassageDesc);

		_onNewNextPassages(newNextPassages);
	}

	const editPassageDesc = (ev, i: number, newPassageDesc: NextPassageDesc) => {
		if (!nextPassages) {
			console.error('YO WTF, how ??', nextPassages, i, newPassageDesc);
			return;
		}

		nextPassages[i] = newPassageDesc;

		let newNextPassages: NextPassageDesc[] = [
			...nextPassages,
		];
		_onNewNextPassages(newNextPassages);
	}

	const removeNextPassage = (ev, i: number) => {
		let newNextPassages: NextPassageDesc[];

		if (!nextPassages) newNextPassages = []
		else {
			nextPassages.splice(i);
			newNextPassages = [
				...nextPassages,
			];
		}

		_onNewNextPassages(newNextPassages);
	}

	const _onNewNextPassages = (newNextPassages: NextPassageDesc[]) => {
		setNextPassages(newNextPassages);

		let cmd = { ...context?.command } as PassageCommand;
		if (!cmd.content) cmd.content = {};
		if (!cmd.content.chooseNextPassageParam) cmd.content.chooseNextPassageParam = {};
		cmd.content.chooseNextPassageParam.nextPassages = newNextPassages;

		//#region help drawing directional arrow in editor
		//==========================
		cmd.content.text = '[[' + newNextPassages.map(each => each.text).join(']] [[') + ']]';
		//#endregion

		context?.editWholeCommand(cmd);
	}

	return <CommandBlockHolder commandType={context?.command?.type}>
		<CommandNavigators />
		<CommandBlockBody>
			{/*<p>#id: {elementIdx}</p>*/}
			<CommandBlockScope width='100%'>
				<InputField
					title="Menu title"
					value={promptTitle || ''}
					sx={{
						width: '100%'
					}}
					onChange={_setPromptTitle}
				/>
			</CommandBlockScope>


			{
				!errObj?.errMessageKey ? null
					: (
						<Box onPointerDown={onClickAlertMsg}
							sx={{
								cursor: 'pointer',
								position: 'relative',
								zIndex: 2, //must sit higher than 'CommandNavigators' otherwise, this won't be clickable
							}}
						>
							<Alert severity="error">
								{parse(
									tError(errObj.errMessageKey)
								)}
							</Alert>
						</Box>
					)
			}
			<Divider sx={{
				marginTop: '10px',
				marginBottom: '10px'
			}}
			/>
			{
				nextPassages?.map((eachNextPassageDesc, i) => {
					return (
						<Box
							className='each-next-passage-desc-container'
							sx={{ mt: '8px' }}
							key={i}
						>
							<NextPassageDescReactComp
								id={elementIdx + '-ChooseNextPassage-index-' + i}
								index={i}
								targetPassageDesc={eachNextPassageDesc}
								removeNextPassage={removeNextPassage}
								editPassageDesc={editPassageDesc}
							/>
							<Divider sx={{
								marginTop: '10px',
								marginBottom: '10px'
							}}
							/>
						</Box>
					)
				})
			}

			<Box sx={{ marginTop: '15px', }}>
				<Button variant={"outlined"}
					onPointerDown={addNextPassage}
					sx={{ backgroundColor: 'white' }}>
					{tComp('promptForMorePassages')}
				</Button>
			</Box>
		</CommandBlockBody>
	</CommandBlockHolder>
}



