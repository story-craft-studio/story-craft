import { useComponentTranslation } from "../../../../util/translation-wrapper";
import * as React from "react";
import { useEffect, useState } from "react";
import DelayTaskUtil from "../../../../util/DelayTaskUtil";
import { Box, Button, MenuItem, FormControl, InputLabel, Select, TextField, Typography, Tooltip, SvgIcon } from "@mui/material";
import { AutoVerticalAlignTypography, FlexBox } from "../../../template/mui-template/flex-box";
import { NextPassageDesc, TargetPassageBy } from "../../../../../shared/typedef/ChooseNextPassageCommandTypeDef";
import { PassageEditContext } from "../../../../dialogs/context/passage-edit-context";
import { Passage } from "../../../../store/stories";
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import FreeSoloPassageNameSelector from "../../../../components/selector/free-solo-passage-name-selector";
import FreeSoloPassageBreakpointSelector from "../../../../components/selector/free-solo-passage-breakpoint-selector";
import { CommandBreakPoints } from "../../../../../shared/typedef/command-break-points";
import StringUtil from "../../../../util/StringUtil";
import _ from "lodash";

// Create NewLabelIcon component using the SVG path
const NewLabelIcon = (props) => {
	return (
		<SvgIcon {...props} viewBox="0 -960 960 960">
			<path d="M480-160v-80h120l180-240-180-240H160v200H80v-200q0-33 23.5-56.5T160-800h440q19 0 36 8.5t28 23.5l216 288-216 288q-11 15-28 23.5t-36 8.5H480Zm-10-320ZM200-120v-120H80v-80h120v-120h80v120h120v80H280v120h-80Z" />
		</SvgIcon>
	);
};

const genUid = () => 'NextPassageDescReactComp-' + StringUtil.randomString();
export function NextPassageDescReactComp(props: {
	id: string,
	targetPassageDesc: NextPassageDesc,
	removeNextPassage: (ev, index: number) => void,
	index: number,
	editPassageDesc: (ev, index: number, targetPassageDesc: NextPassageDesc) => void
}) {
	const [uid] = useState(genUid());

	const { allPassages } = React.useContext(PassageEditContext);
	const { id, targetPassageDesc, removeNextPassage, index, editPassageDesc } = props;

	const { tComp } = useComponentTranslation('chooseNextPassageCommandInput');

	const [targetPassageBy, setTargetPassageBy] = useState<TargetPassageBy>(TargetPassageBy.breakPoint);
	const [showBreakpointSelector, setShowBreakpointSelector] = useState<boolean>(!!targetPassageDesc.breakPointName);

	// const handleTargetByChange = (ev) => {
	// 	let newTargetPassageBy: TargetPassageBy = ev.target.value;
	// 	if (newTargetPassageBy === targetPassageBy) return;

	// 	setTargetPassageBy(newTargetPassageBy);

	// 	DelayTaskUtil.reInvokeDelayTask(id + '-setTargetPassageBy', () => {
	// 		targetPassageDesc.targetBy = ev.target.value;
	// 		editPassageDesc(ev, index, targetPassageDesc);
	// 	}, 0.5);
	// }

	const [promptText, setPromptText] = useState<string>(targetPassageDesc.promptText || '');
	const _setPromptText = (ev) => {
		let newVal = ev.target.value || '';
		setPromptText(newVal);

		DelayTaskUtil.reInvokeDelayTask(id + '-setPromptText', () => {
			targetPassageDesc.promptText = newVal;
			editPassageDesc(ev, index, targetPassageDesc);
		}, 1)
	}


	const getPassageWithName = (pName: string): Passage | undefined => {
		return allPassages.find(anyP => anyP.name === pName);
	}

	const [passageName, setPassageName] = useState<string>(targetPassageDesc.text || '');
	const [hasSuchName, setHasSuchName] = useState(true);
	useEffect(() => {
		setHasSuchName(_.includes(allPassages.map(each => each.name), passageName));
	}, [passageName, allPassages]);

	const choosePassageName = (passageName: string) => {
		let newVal = passageName;
		setPassageName(newVal);

		DelayTaskUtil.reInvokeDelayTask(id + '-choosePassageName', () => {
			targetPassageDesc.text = newVal;
			editPassageDesc(undefined, index, targetPassageDesc);
		}, 1)
	}


	const [commandBreakPoints, setCommandBreakPoints] = useState<CommandBreakPoints | undefined>();
	const [hasSuchBPName, setHasSuchBPName] = useState<boolean>(false);
	const [passageBreakPointName, setPassageBreakPointName] = useState<string>(targetPassageDesc.breakPointName || '');

	const choosePassageBreakPoint = (newVal: string) => {
		setPassageBreakPointName(newVal);

		DelayTaskUtil.reInvokeDelayTask(id + '-choosePassageBreakPoint', () => {
			targetPassageDesc.breakPointName = newVal;
			editPassageDesc(undefined, index, targetPassageDesc);

			// Hide breakpoint selector if the value is cleared
			if (!newVal) {
				setShowBreakpointSelector(false);
			}
		}, 1)
	}

	useEffect(() => {
		if (!commandBreakPoints) return;
		DelayTaskUtil.reInvokeDelayTask(uid + '-setHasSuchBPName', () => {
			setHasSuchBPName(commandBreakPoints.hasBPName(passageBreakPointName));
		})
	}, [commandBreakPoints, passageBreakPointName]);


	return (
		<Box className='next-passage-desc-react-comp'
			key={id}
		>
			<Box className='row' sx={{
				display: 'flex',
				flexDirection: 'row',
				alignItems: 'center',
				gap: 2
			}}>
				<IconButton
					aria-label="delete"
					onClick={(ev) => removeNextPassage(ev, index)}
					sx={{ position: 'relative', left: '-40px' }}
				>
					<DeleteIcon color="error" />
				</IconButton>

				<TextField
					label={"Option " + (index + 1)}
					size="small"
					value={promptText || ''}
					onChange={_setPromptText}
					sx={{ flex: 1, backgroundColor: "white", mr: '10px', ml: '-50px' }}
				/>

				{
					targetPassageBy === TargetPassageBy.breakPoint
						? <Box sx={{ width: '40%', ml: '-20px' }}>
							<FlexBox sx={{ width: '100%', display: 'flex', alignItems: 'center' }}>
								<FreeSoloPassageNameSelector
									allNames={allPassages.map(each => each.name)}
									value={passageName || ''}
									onChange={pName => choosePassageName(pName)}
									sx={{ mt: '5px', width: '100%' }}
									inputSx={{
										'& .MuiOutlinedInput-notchedOutline': {
											borderWidth: hasSuchName ? '1px' : '2px',
											borderColor: hasSuchName ? 'black' : 'red',
										},
									}}
								/>
								<Tooltip title={tComp("addPassageBreakpointTag")} arrow placement="top">
									<span>
										<IconButton
											aria-label="add-tag"
											onClick={() => setShowBreakpointSelector(true)}
											disabled={showBreakpointSelector || !passageName}
											sx={{
												ml: 1
											}}
										>
											<NewLabelIcon 
												color={(showBreakpointSelector || !passageName) ? 'disabled' : 'primary'} 
												fontSize="medium"
											/>
										</IconButton>
									</span>
								</Tooltip>
							</FlexBox>
							{showBreakpointSelector && (
								<FlexBox sx={{ width: '100%' }}>
									<FreeSoloPassageBreakpointSelector
										passage={getPassageWithName(passageName)}
										value={passageBreakPointName || ''}
										onChange={bpName => choosePassageBreakPoint(bpName)}
										onCommandBreakPointsChange={newCommandBreakPoints => setCommandBreakPoints(newCommandBreakPoints)}
										sx={{ mt: '15px', width: '100%' }}
										inputSx={{
											'& .MuiOutlinedInput-notchedOutline': {
												borderWidth: hasSuchBPName ? '1px' : '2px',
												borderColor: hasSuchBPName ? 'black' : 'red',
											},
										}}
									/>
								</FlexBox>
							)}
						</Box>
						: null
				}
			</Box>
		</Box>
	)
}
