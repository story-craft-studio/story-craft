import * as React from "react";
import { useEffect, useState, useCallback } from "react";
import { CommandBlockBody, CommandBlockHolder, CommandCheckbox } from "../../command-blocks/base-ui";
import { CommandListItemContext } from "../../../../components/control/passage-command-area/CommandListItemContext";
import CommandNavigators from "../../../../components/control/passage-command-area/CommandNavigators";
import { useCommonTranslation, useComponentTranslation } from "../../../../util/translation-wrapper";
import { Autocomplete, Box, TextField, Fade, IconButton, Tooltip, FormControl, InputLabel } from "@mui/material";
import FlipIcon from '@mui/icons-material/Flip';
import EvtMgr, { EventName } from "../../../evt-mgr";
import { CharacterMgr } from "../../../../routes/story-edit/toolbar/settings/character-settings/character-mgr";
import _ from "lodash";
import StringUtil from "../../../../util/StringUtil";
import { CommandListItemContextType } from "../CommandInputTypeDefs";
import {
	CharacterShowPosition,
	ShowCharacterTransition,
} from "../../../../../shared/typedef/character-command-inputs-typedef";
import CharacterSkinSelector from "../../../template/character-skin-selector";
import { FlexBox } from "../../../template/mui-template/flex-box";
import SimpleSelect from "../../../template/mui-template/simple-select";
import { ShowCharOption, MuiAutoCompleteShowLabelLike } from "../../../../../shared/typedef/CommandShowCharTypeDef";
import { ToggleIconButton } from "../../command-blocks/toggle-icon-button";
import { ICON_LEFT, ICON_RIGHT, ICON_MIDDLE } from "../../../../components/icons";

const genUid = (context?: CommandListItemContextType) => {
	let pid = context?.passage?.id || StringUtil.randomString();
	let cIndex = context?.commandIndex || StringUtil.randomString();
	return `CharacterShowCommandBlock-${pid}-${cIndex}-${StringUtil.randomString()}`;
}

function getSkinIndex(context?: CommandListItemContextType) {
	if (_.isNil(context?.command?.content?.skinIndex)) {
		return 0;
	}
	return Number(context?.command?.content?.skinIndex);
}

function findCharIndex(context?: CommandListItemContextType) {
	let targetName = context?.command?.content?.toShowTarget;
	return CharacterMgr.findCharIndexWithName(targetName);
}

export default function CharacterShowCommandBlock() {
	const context = React.useContext(CommandListItemContext);
	const [uid] = useState(genUid(context))

	const { tCommon } = useCommonTranslation();
	const { tComp } = useComponentTranslation('characterShowCommandBlock');

	const [characterIndex, setCharacterIndex] = useState<number>(
		findCharIndex(context)
	);

	const [targetCharName, setTargetCharName] = useState<string>(context?.command?.content?.toShowTarget || '');
	const [skinIndex, setSkinIndex] = useState<number>(
		getSkinIndex(context)
	)

	// Initialize isCharacterJoin toggle from context or default to true (show)
	const [isCharacterJoin, setIsCharacterJoin] = useState<boolean>(
		context?.command?.content?.isCharacterJoin === undefined ? true : context?.command?.content?.isCharacterJoin
	);

	// Thêm state cho flipX
	const [flipX, setFlipX] = useState<boolean>(
		context?.command?.content?.flipX === undefined ? false : context?.command?.content?.flipX
	);

	const saveCommand = () => {
		if (!context?.command || !context.editWholeCommand) return;
		context.editWholeCommand({...context.command});
	}

	// Initialize command content isCharacterJoin to true when undefined
	useEffect(() => {
		if (context?.command && context.command.content?.isCharacterJoin === undefined) {
			handleIsCharacterJoinChange(true);
		}
	}, []);

	const handleIsCharacterJoinChange = (newValue: boolean) => {
		if (!context?.command) return;

		setIsCharacterJoin(newValue);
		handleChangeHideAll(false);

		// Create a new content object to avoid reference issues
		context.command.content = {
			...context.command.content || {},
			isCharacterJoin: newValue,
		};
		
		saveCommand();
	};

	// Handler for character flip
	const handleFlipXChange = () => {
		if (!context?.command) return;
		
		const newValue = !flipX;
		setFlipX(newValue);
		
		// Create a new content object to avoid reference issues
		context.command.content = {
			...context.command.content || {},
			flipX: newValue,
		};
		
		saveCommand();
	};

	// Initialize flipX on component mount if not already set
	useEffect(() => {
		if (context?.command && context.command.content?.flipX === undefined) {
			// Create a new content object to avoid reference issues
			context.command.content = {
				...context.command.content || {},
				flipX: false,
			};
			
			saveCommand();
		}
	}, []);

	const [isHideAll, setIsHideAll] = useState<boolean>(
		context?.command?.content?.isHideAll !== false
	);
	const handleChangeHideAll = (newValue: boolean) => {
		if (!context?.command) return;

		setIsHideAll(newValue);

		// Create a new content object to avoid reference issues
		context.command.content = {
			...context.command.content || {},
			isHideAll: newValue,
		};
		
		saveCommand();
	};

	const onNewSkinIndex = (newSkinIndex: number) => {
		if (!context?.command) return;

		setSkinIndex(newSkinIndex);

		console.log('context.command.content before change skin', context.command.content);
		// Create a new content object to avoid reference issues
		context.command.content = {
			...context.command.content || {},
			skinIndex: newSkinIndex,
		};
		
		saveCommand();
	}
	// Initialize skin index on component mount if not already set
	useEffect(() => {
		if (context?.command && context.command.content?.skinIndex === undefined) {
			onNewSkinIndex(0);
		}
	}, []);

	const onAutocompleteChangeCharacterToShow = (ev, newValue: MuiAutoCompleteShowLabelLike | string | null) => {
		let selectedAsString: string;
		if (!newValue) {
			selectedAsString = '';
		}
		else if (_.isString(newValue)) {
			selectedAsString = newValue;
		}
		else {
			selectedAsString = newValue.label || '';
		}
		onChangeInnerTextField(selectedAsString);
	}
	const onChangeInnerTextField = (selectedAsString: string) => {
		if (!context?.command) return;

		let selectedShowOption: ShowCharOption = 'byExactName';
		allOptions.some(someOption => {
			let matched = someOption.label === selectedAsString
				|| someOption.label.trim().toLowerCase() === selectedAsString;
			if (matched) {
				selectedShowOption = someOption.showOption;
				return true;
			}
			return false;
		})

		console.log('context.command.content before change showTarget', context.command.content);
		setTargetCharName(selectedAsString);

		if (selectedShowOption === "byExactName") {
			let foundCharIndex = CharacterMgr.findCharIndexWithName(selectedAsString, { useLowerCase: true, useTrim: true });
			setCharacterIndex(foundCharIndex);
			if (foundCharIndex < 0) {
				console.warn('CharacterShowCommandBlock: No such character with name ', selectedAsString);
			}
		}
		
		// Create a new content object to avoid reference issues
		context.command.content = {
			...context.command.content || {},
			toShowTarget: selectedAsString,
			toShowOption: selectedShowOption,
		};
		
		saveCommand();
	}

	const [allOptions, setAllOptions] = useState<MuiAutoCompleteShowLabelLike[]>([]);
	const reloadAllCharacterNames = () => {
		let allCharNames: MuiAutoCompleteShowLabelLike[] = CharacterMgr.getAlls().map((each, index) => {
			return { label: each.displayName, showOption: 'byExactName' };
		}) || [];

		let newAllOptions = allCharNames;
		newAllOptions.push({
			label: tCommon('none'),
			showOption: 'none',
		});

		setAllOptions(
			newAllOptions
		);
	}
	useEffect(() => {
		reloadAllCharacterNames();
		EvtMgr.on(EventName.characterChange, reloadAllCharacterNames);
		return () => {
			EvtMgr.off(EventName.characterChange, reloadAllCharacterNames);
		}
	}, []);


	let curAutocompleteValue: MuiAutoCompleteShowLabelLike = {
		label: targetCharName,
		showOption: context?.command?.content?.toShowOption,
	};

	const [pos, setPos] = useState<CharacterShowPosition | undefined>(context?.command?.content?.position);
	const _editPos = (ev, pos) => {
		console.log('_editPos', pos);
		if (!context?.command) return;

		setPos(pos);
		
		// Create a new content object to avoid reference issues
		context.command.content = {
			...context.command.content || {},
			position: pos,
		};
		
		saveCommand();
	}
	// Initialize position on component mount if not already set
	useEffect(() => {
		if (context?.command && !context.command.content?.position) {
			_editPos(null, pos || CharacterShowPosition.left);
		}
	}, []);

	const [transit, setTransit] = useState<ShowCharacterTransition | undefined>(context?.command?.content?.transition);
	const _editTransition = (ev, newTransit) => {
		if (!context?.command) return;

		setTransit(newTransit);
		
		// Create a new content object to avoid reference issues
		context.command.content = {
			...context.command.content || {},
			transition: newTransit,
		};
		
		saveCommand();
	}
	// Initialize transition on component mount if not already set
	useEffect(() => {
		if (context?.command && !context.command.content?.transition) {
			_editTransition(null, ShowCharacterTransition.none);
		}
	}, []);

	return (
		<CommandBlockHolder commandType={context?.command?.type}>
			<CommandNavigators />

			<CommandBlockBody>
				<FlexBox sx={{ width: '100%' }}>
					<Box sx={{
						width:
							(!isCharacterJoin && !isHideAll)
								? '100%'
								: '50%'
						,
						display: 'flex',
						alignItems: 'center'
					}}>
						<Box sx={{ mr: 1 }}>
							<ToggleIconButton
								value={isCharacterJoin}
								onChange={handleIsCharacterJoinChange}
								joinLabel={tComp("show")}
								leaveLabel={tComp("hide")}
							/>
						</Box>
						{/* When Join, do not show checkbox hide all */}
						{!isCharacterJoin && (
							<CommandCheckbox
								text={tComp("hideAll")}
								value={isHideAll}
								onChange={handleChangeHideAll}
							/>
						)}
						{/* When Hide-All, do not show character picker */}
						{(isCharacterJoin || (!isCharacterJoin && !(isHideAll))) && (
							<Box sx={{ flex: 1 }}>
								<Autocomplete
									freeSolo
									autoComplete
									options={allOptions}
									onChange={onAutocompleteChangeCharacterToShow}
									placeholder={context?.otherProps?.options?.placeholder}
									value={curAutocompleteValue}
									renderInput={(params) => <TextField
										{...params}
										label={tComp("characterName")}
										onChange={ev => onChangeInnerTextField(ev.target.value)}
										size="small"
									/>}
									sx={{
										p: 0,
										backgroundColor: 'white',
										'& .MuiAutocomplete-inputRoot': {
											padding: '0 14px'
										}
									}}
								/>
							</Box>
						)}
					</Box>

					{/* When Character picker is empty, do not show skin picker */}
					{isCharacterJoin && curAutocompleteValue?.label && curAutocompleteValue?.showOption !== "none" && (
						<Fade in={true} timeout={500}>
							<Box sx={{ ml: '15px', width: '45%' }}>
								<CharacterSkinSelector
									placeholder={tComp('pickASkin')}
									initialSkinIndex={skinIndex}
									characterIndex={characterIndex}
									onChangeSkinIndex={onNewSkinIndex}
								/>
							</Box>
						</Fade>
					)}
				</FlexBox>

				{isCharacterJoin && curAutocompleteValue?.label && curAutocompleteValue?.showOption !== "none" && (
					<Fade in={true} timeout={500}>
						<FlexBox sx={{ width: '100%', ml: '22px', mr: '25px' }}>
							{/* Flip Character */}
							<Box sx={{ width: '62px', pt: '10px', mr: '3px' }}>
								<FormControl fullWidth>
									<InputLabel 
										id="flip-character-label" 
										shrink 
										sx={{ 
											backgroundColor: 'white',
											transform: 'translate(14px, -6px) scale(0.75)'
										}}
									>
										{tComp('flipCharacter') || "Flip"}
									</InputLabel>
									<Box sx={{ 
										height: '40px', 
										display: 'flex', 
										alignItems: 'center', 
										border: '1px solid rgba(0, 0, 0, 0.23)', 
										borderRadius: '4px',
										pl: 1,
										width: '90%',
										backgroundColor: 'white',
										mt: 0
									}}>
										<IconButton 
											onClick={handleFlipXChange}
											color={flipX ? "primary" : "default"}
											sx={{ 
												transition: 'all 0.2s',
												transform: flipX ? 'scaleX(-1)' : 'scaleX(1)',
												color: flipX ? 'primary.main' : 'rgba(0, 0, 0, 0.38)'
											}}
										>
											<FlipIcon />
										</IconButton>
									</Box>
								</FormControl>
							</Box>

							{/* Character position */}
							<Box sx={{ width: '36%', pt: '10px' }}>
								<SimpleSelect
									label={tComp('position')}
									value={pos || CharacterShowPosition.left}
									options={Object.keys(CharacterShowPosition)}
									getDisplayName={n => tCommon(displayNameMap.get(n))}
									getIcon={getPositionIcon}
									onChange={_editPos}
								/>
							</Box>

							{/* Character transition */}
							<Box sx={{ width: '35%', pt: '10px' }}>
								<SimpleSelect
									label={tComp('transition')}
									value={transit || ShowCharacterTransition.none}
									options={Object.keys(ShowCharacterTransition)}
									getDisplayName={n => tCommon(displayNameMap.get(n))}
									onChange={_editTransition}
								/>
							</Box>
						</FlexBox>
					</Fade>
				)}
			</CommandBlockBody>
		</CommandBlockHolder>
	);
}


const displayNameMap = new Map();
displayNameMap.set(CharacterShowPosition.left, 'left');
displayNameMap.set(CharacterShowPosition.right, 'right');
displayNameMap.set(CharacterShowPosition.middle, 'middle');
displayNameMap.set(ShowCharacterTransition.slow, 'veerrrySlow');
displayNameMap.set(ShowCharacterTransition.fast, 'faaaasssst');
displayNameMap.set(ShowCharacterTransition.none, 'char-trans-none');

const getPositionIcon = (position: string) => {
	switch (position) {
		case CharacterShowPosition.left:
			return <img src={ICON_LEFT} alt="left" style={{ width: '20px', height: '20px' }} />;
		case CharacterShowPosition.right:
			return <img src={ICON_RIGHT} alt="right" style={{ width: '20px', height: '20px' }} />;
		case CharacterShowPosition.middle:
			return <img src={ICON_MIDDLE} alt="middle" style={{ width: '20px', height: '20px' }} />;
		default:
			return null;
	}
};
