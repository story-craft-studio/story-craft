import * as React from "react";
import {useEffect, useState} from "react";
import {PassageEditContext} from "../../../../dialogs/context/passage-edit-context";
import {useComponentTranslation} from "../../../../util/translation-wrapper";
import {CommandListItemContext} from "../../../../components/control/passage-command-area/CommandListItemContext";
import {CommandListItemContextType} from "../CommandInputTypeDefs";
import StringUtil from "../../../../util/StringUtil";
import CommandNavigators from "../../../../components/control/passage-command-area/CommandNavigators";
import {PassageCommand} from "../../PassageCommandTypeDef";
import {Passage} from "../../../../store/stories";
import DelayTaskUtil from "../../../../util/DelayTaskUtil";
import {CommandBlockBody, CommandBlockHolder} from "../../command-blocks/base-ui";
import _ from "lodash";
import FreeSoloPassageNameSelector from "../../../../components/selector/free-solo-passage-name-selector";
import FreeSoloPassageBreakpointSelector from "../../../../components/selector/free-solo-passage-breakpoint-selector";
import {CommandBreakPoints} from "../../../../../shared/typedef/command-break-points";
import {Box, IconButton, Tooltip, SvgIcon} from "@mui/material";

// Create NewLabelIcon component using the SVG path
const NewLabelIcon = (props) => {
	return (
		<SvgIcon {...props} viewBox="0 -960 960 960">
			<path d="M480-160v-80h120l180-240-180-240H160v200H80v-200q0-33 23.5-56.5T160-800h440q19 0 36 8.5t28 23.5l216 288-216 288q-11 15-28 23.5t-36 8.5H480Zm-10-320ZM200-120v-120H80v-80h120v-120h80v120h120v80H280v120h-80Z" />
		</SvgIcon>
	);
};

function genElementId(_commandListItemContext?: CommandListItemContextType) {
	if (!_commandListItemContext) {
		console.error('JumpToPassageCommand Found some messed up shit!');
		return `pid-${StringUtil.randomString()}-JumpToPassageCommand-${StringUtil.randomString()}`;
	}

	let rand = StringUtil.randomString();
	return `${rand}-pid-${_commandListItemContext.passage.id}-${_commandListItemContext.commandIndex}`;
}

export default function JumpToPassageCommand() {
	const context = React.useContext(CommandListItemContext);
	const [uid] = useState(genElementId(context));

	const {tComp} = useComponentTranslation('jumpToPassageCommand');

	const {passage, allPassages, story} = React.useContext(PassageEditContext);
	const [allPassageNames, setAllPassageNames] = useState<string[]>([]);
	useEffect(() => {
		setAllPassageNames(_.uniq(allPassages.map(eachP => eachP.name)));
	}, [allPassages]);

	const [targetPassageName, setTargetPassageName] = useState<string>(
		context?.command?.content?.jumpToPassageCommandParams?.targetPassageName
	);
	const [hasSuchName, setHasSuchName] = useState(true);
	useEffect(() => {
		setHasSuchName(_.includes(allPassageNames, targetPassageName));
	}, [targetPassageName, allPassageNames]);

	const handleTargetPassageChange = (pName: string) => {
		if (!context) return;

		setTargetPassageName(pName);
		if (pName === targetPassageName) return;

		DelayTaskUtil.reInvokeDelayTask(uid + '-handleTargetPassageChange', () => {
			let cmd = {...context.command} as PassageCommand;
			if (!cmd.content) cmd.content = {};
			if (!cmd.content.jumpToPassageCommandParams) cmd.content.jumpToPassageCommandParams = {};
			cmd.content.jumpToPassageCommandParams.targetPassageName = pName;

			//#region help drawing directional arrow in editor
			//==========================
			let hasSuchName = _.includes(allPassageNames, pName);
			if (!hasSuchName) {
				cmd.content.text = '';
			}
			else {
				cmd.content.text = `[[${pName}]]`;
			}
			//#endregion

			context.editWholeCommand(cmd);
		}, 0.5);
	}

	const [commandBreakPoints, setCommandBreakPoints] = useState<CommandBreakPoints | undefined>();
	const [hasSuchBPName, setHasSuchBPName] = useState<boolean>(false);
	const [targetBPName, setTargetBPName] = useState(
		context?.command?.content.jumpToPassageCommandParams?.targetBreakPointName || ''
	);
	const [showBreakpointSelector, setShowBreakpointSelector] = useState<boolean>(!!targetBPName);

	useEffect(() => {
		if (!commandBreakPoints) return;
		DelayTaskUtil.reInvokeDelayTask(uid + '-setHasSuchBPName', () => {
			setHasSuchBPName(commandBreakPoints.hasBreakPointName(targetBPName));
		})
	}, [commandBreakPoints, targetBPName]);

	const handleTargetBreakPointChange = (bpName: string) => {
		if (!context) return;

		setTargetBPName(bpName);
		if (bpName === targetBPName) return;

		DelayTaskUtil.reInvokeDelayTask(uid + '-handleTargetBreakPointChange', () => {
			let cmd = {...context.command} as PassageCommand;
			if (!cmd.content) cmd.content = {};
			if (!cmd.content.jumpToPassageCommandParams) cmd.content.jumpToPassageCommandParams = {};
			cmd.content.jumpToPassageCommandParams.targetBreakPointName = bpName;

			context.editWholeCommand(cmd);
		}, 0.5);
	}

	const getPassageWithName = (pName: string): Passage | undefined => {
		return allPassages.find(anyP => anyP.name === pName);
	}

	return (
		<CommandBlockHolder commandType={context?.command.type}>
			<CommandNavigators/>
			<CommandBlockBody>
				<Box className='jump-to-passage-command'
					sx={{
						display: 'flex',
						flexDirection: 'column',
						gap: 2
					}}
				>
					<Box sx={{ width: '100%' }}>
						<Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 2 }}>
							<Box sx={{ width: showBreakpointSelector ? '50%' : '100%' }}>
								<FreeSoloPassageNameSelector
									allNames={allPassageNames}
									value={targetPassageName || ''}
									onChange={pName => handleTargetPassageChange(pName)}
									sx={{ mt: '5px', width: '100%' }}
									inputSx={{
										'& .MuiOutlinedInput-notchedOutline': {
											borderWidth: hasSuchName ? '1px' : '2px',
											borderColor: hasSuchName ? 'black' : 'red',
										},
									}}
								/>
							</Box>
							{!showBreakpointSelector && (
								<Tooltip title={tComp("addPassageBreakpointTag")} arrow placement="top">
									<span>
										<IconButton
											aria-label="add-tag"
											onClick={() => setShowBreakpointSelector(true)}
											disabled={!targetPassageName}
											sx={{
												ml: 1
											}}
										>
											<NewLabelIcon 
												color={!targetPassageName ? 'disabled' : 'primary'} 
												fontSize="medium"
											/>
										</IconButton>
									</span>
								</Tooltip>
							)}
							{showBreakpointSelector && (
								<Box sx={{ width: '50%' }}>
									<FreeSoloPassageBreakpointSelector
										passage={getPassageWithName(targetPassageName)}
										value={targetBPName || ''}
										onChange={bpName => handleTargetBreakPointChange(bpName)}
										onCommandBreakPointsChange={newCommandBreakPoints => setCommandBreakPoints(newCommandBreakPoints)}
										sx={{ mt: '5px', width: '100%' }}
										inputSx={{
											'& .MuiOutlinedInput-notchedOutline': {
												borderWidth: hasSuchBPName ? '1px' : '2px',
												borderColor: hasSuchBPName ? 'black' : 'red',
											},
										}}
									/>
								</Box>
							)}
						</Box>
					</Box>
				</Box>
			</CommandBlockBody>
		</CommandBlockHolder>
	)
}
