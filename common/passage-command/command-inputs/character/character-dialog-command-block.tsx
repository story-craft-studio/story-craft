import * as React from "react";
import { useEffect, useState, useCallback, useRef } from "react";
import { CommandBlockBody, CommandBlockHolder, InputField } from "../../command-blocks/base-ui";
import { CommandListItemContext } from "../../../../components/control/passage-command-area/CommandListItemContext";
import CommandNavigators from "../../../../components/control/passage-command-area/CommandNavigators";
import { useCommonTranslation, useComponentTranslation } from "../../../../util/translation-wrapper";
import { Autocomplete, Box, TextField } from "@mui/material";
import EvtMgr, { EventName } from "../../../evt-mgr";
import { CharacterMgr } from "../../../../routes/story-edit/toolbar/settings/character-settings/character-mgr";
import StringUtil from "../../../../util/StringUtil";
import SimpleSelect from "../../../template/mui-template/simple-select";
import { DialogShowPosition, ShowCharacterTransition } from "../../../../../shared/typedef/character-command-inputs-typedef";
import { ICON_LEFT, ICON_RIGHT } from "../../../../components/icons";
import { PassageCommand } from "../../PassageCommandTypeDef";
import _ from "lodash";

type CharacterDialogParams = {
	characterName?: string;
	position?: DialogShowPosition;
	dialogText?: string;
};

const genUid = () => 'CharacterDialogCommandBlock-' + StringUtil.randomString();

export default function CharacterDialogCommandBlock() {
	const [uid] = useState(genUid());
	const context = React.useContext(CommandListItemContext);

	const { t } = useComponentTranslation('characterDialogCommandBlock');
	const { tCommon } = useCommonTranslation();
	const { tComp } = useComponentTranslation('characterShowCommandBlock');

	// Centralized local state
	const [localState, setLocalState] = useState<CharacterDialogParams>(() => ({
		characterName: context?.command?.content?.characterName || '',
		position: context?.command?.content?.position || DialogShowPosition.left,
		dialogText: context?.commandText || ''
	}));

	// Ref to track pending debounced calls
	const pendingUpdateRef = useRef<(() => void) | null>(null);
	const isUserEditing = useRef(false);

	// Centralized update function that batches all changes
	const updateCommand = useCallback((updates: Partial<CharacterDialogParams>, immediate = false) => {
		if (!context?.command || !context?.editWholeCommand) {
			console.error('Cannot edit command: missing context');
			return;
		}

		// Flush any pending debounced calls if this is an immediate update
		if (immediate && pendingUpdateRef.current) {
			pendingUpdateRef.current();
			pendingUpdateRef.current = null;
		}

		const newState = { ...localState, ...updates };
		setLocalState(newState);

		const updateCommandWithState = () => {
			const cmd = { ...context.command } as PassageCommand;
			if (!cmd.content) cmd.content = {};
			
			// Update content with new state (excluding dialogText)
			if ('characterName' in updates || 'position' in updates) {
				Object.assign(cmd.content, {
					characterName: newState.characterName,
					position: newState.position
				});
				context.editWholeCommand(cmd);
			}
			
			// Update command text if dialogText changed
			if ('dialogText' in updates && context._onChangeText) {
				context._onChangeText(newState.dialogText || '');
			}
			
			pendingUpdateRef.current = null;
		};

		if (immediate) {
			updateCommandWithState();
		} else {
			// Store the update function and debounce it
			pendingUpdateRef.current = updateCommandWithState;
			debouncedUpdate();
		}
	}, [localState, context]);

	// Debounced update function
	const debouncedUpdate = useCallback(
		_.debounce(() => {
			if (pendingUpdateRef.current) {
				pendingUpdateRef.current();
			}
		}, 0),
		[]
	);

	// Sync from external command changes
	useEffect(() => {
		if (isUserEditing.current) return;
		
		setLocalState(prev => ({
			...prev,
			characterName: context?.command?.content?.characterName || '',
			position: context?.command?.content?.position || DialogShowPosition.left,
			dialogText: context?.commandText || ''
		}));
	}, [context?.command?.content?.characterName, context?.command?.content?.position, context?.commandText]);

	// Event handlers
	const handleCharacterNameChange = useCallback((newName: string) => {
		updateCommand({ characterName: newName }, true); // Immediate for autocomplete responsiveness
	}, [updateCommand]);

	const handlePositionChange = useCallback((ev: any, option: string, optionIndex: number) => {
		const position = option as DialogShowPosition;
		updateCommand({ position }, true); // Immediate for UI responsiveness
	}, [updateCommand]);

	const handleDialogTextChange = useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
		isUserEditing.current = true;
		updateCommand({ dialogText: ev.target.value }, true);
		setTimeout(() => { isUserEditing.current = false; }, 500);
	}, [updateCommand]);

	// Autocomplete specific handlers
	const onAutocompleteChangeCharacterTitle = useCallback((ev: any, name: string | null) => {
		handleCharacterNameChange(name || '');
	}, [handleCharacterNameChange]);

	// Character names management
	const [allCharacterNames, setAllCharacterNames] = useState<string[]>([]);
	const reloadAllCharacterNames = useCallback(() => {
		setAllCharacterNames(
			CharacterMgr.getAlls().map((each) => each.displayName) || []
		);
	}, []);

	useEffect(() => {
		reloadAllCharacterNames();
		EvtMgr.on(EventName.characterChange, reloadAllCharacterNames);
		return () => {
			EvtMgr.off(EventName.characterChange, reloadAllCharacterNames);
		};
	}, [reloadAllCharacterNames]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			debouncedUpdate.cancel();
		};
	}, [debouncedUpdate]);

	return (
		<CommandBlockHolder commandType={context?.command?.type}>
			<CommandNavigators />
			<CommandBlockBody>
				<Box sx={{ display: 'flex' }}>
					<Autocomplete
						freeSolo
						options={allCharacterNames}
						onChange={onAutocompleteChangeCharacterTitle}
						placeholder={context?.otherProps?.options?.placeholder}
						value={localState.characterName}
						renderInput={(params) => <TextField
							{...params}
							label={t("characterName")}
							onChange={ev => handleCharacterNameChange(ev.target.value)}
							size="small"
						/>}
						sx={{
							p: 0,
							width: '45%',
							backgroundColor: 'white',
							height: "40px",
						}}
					/>
					<Box sx={{ width: '45%', marginLeft: '10px' }}>
						<SimpleSelect
							label={tComp('position')}
							value={localState.position}
							options={Object.keys(DialogShowPosition)}
							getDisplayName={n => tCommon(displayNameMap.get(n))}
							getIcon={getPositionIcon}
							onChange={handlePositionChange}
						/>
					</Box>
				</Box>
				<Box sx={{ display: 'flex', marginTop: '10px' }}>
					<InputField
						sx={{
							width: '90%',
						}}
						title={t("dialogContent")}
						onChange={handleDialogTextChange}
						placeholder={context?.otherProps?.options?.placeholder}
						value={localState.dialogText}
						multiline={true}
					/>
				</Box>
			</CommandBlockBody>
		</CommandBlockHolder>
	);
}

const displayNameMap = new Map();
displayNameMap.set(DialogShowPosition.left, 'left');
displayNameMap.set(DialogShowPosition.right, 'right');
displayNameMap.set(ShowCharacterTransition.slow, 'veerrrySlow');
displayNameMap.set(ShowCharacterTransition.fast, 'faaaasssst');
displayNameMap.set(ShowCharacterTransition.none, 'char-trans-none');

const getPositionIcon = (position: string) => {
	switch (position) {
		case DialogShowPosition.left:
			return <img src={ICON_LEFT} alt="left" style={{ width: '20px', height: '20px' }} />;
		case DialogShowPosition.right:
			return <img src={ICON_RIGHT} alt="right" style={{ width: '20px', height: '20px' }} />;
		default:
			return null;
	}
};