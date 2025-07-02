import * as React from "react";
import { useEffect, useState, useCallback, useRef } from "react";
import { CommandListItemContext } from "../../../components/control/passage-command-area/CommandListItemContext";
import { PassageCommand } from "../PassageCommandTypeDef";
import CommandNavigators from "../../../components/control/passage-command-area/CommandNavigators";
import {
	MuiStyledCommandTextField,
	MuiStyledInputContainer
} from "../../template/mui-template/CommandInputsMuiTemplate";
import { CommandBlockHolder, CommandBlockBody, CommandCheckbox, InputField, CommandBlockScope } from '../command-blocks/base-ui';
import {useComponentTranslation} from "../../../util/translation-wrapper";
import { Box, FormControl, Select, MenuItem } from "@mui/material";
import _ from "lodash";

type DelayParams = {
	useModal?: boolean;
	modalHeaderText?: string;
	modalBodyText?: string;
	value?: string;
	unit?: 'ms' | 's' | 'm';
};

export let DelayCommandBlock = (): React.JSX.Element => {
	const context = React.useContext(CommandListItemContext);
	const {t} = useComponentTranslation('delayCommandBlock');
	
	// Centralized local state
	const [localState, setLocalState] = useState<DelayParams>(() => ({
		useModal: context?.command?.content?.delayParam?.useModal || false,
		modalHeaderText: context?.command?.content?.delayParam?.modalHeaderText || '',
		modalBodyText: context?.command?.content?.delayParam?.modalBodyText || '',
		value: context?.command?.content?.delayParam?.value || '0',
		unit: context?.command?.content?.delayParam?.unit || 'ms'
	}));
	
	// Ref to track pending debounced calls
	const pendingUpdateRef = useRef<(() => void) | null>(null);
	const isUserEditing = useRef(false);

	// Parse command text to extract delay value and unit
	const parseCommandText = useCallback((text: string) => {
		const match = text.match(/(\d+)(ms|s|m)?/i);
		if (match) {
			return {
				value: match[1],
				unit: (match[2]?.toLowerCase() || 'ms') as 'ms' | 's' | 'm'
			};
		}
		return null;
	}, []);

	// Centralized update function that batches all changes
	const updateCommand = useCallback((updates: Partial<DelayParams>, immediate = false) => {
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
			if (!cmd.content.delayParam) cmd.content.delayParam = {};
			
			// Update delayParam with new state
			Object.assign(cmd.content.delayParam, newState);
			
			// Update command text if value or unit changed
			if ('value' in updates || 'unit' in updates) {
				const commandText = `${newState.value}${newState.unit === 'ms' ? '' : newState.unit}`;
				if (context._onChangeText) {
					context._onChangeText(commandText);
				}
			}
			
			context.editWholeCommand(cmd);
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
		}, 300),
		[]
	);

	// Sync from external command changes
	useEffect(() => {
		if (isUserEditing.current) return;
		
		const commandParams = context?.command?.content?.delayParam;
		if (commandParams) {
			setLocalState(prev => ({
				...prev,
				useModal: commandParams.useModal || false,
				modalHeaderText: commandParams.modalHeaderText || '',
				modalBodyText: commandParams.modalBodyText || '',
				value: commandParams.value || '0',
				unit: commandParams.unit || 'ms'
			}));
		}
	}, [context?.command?.content?.delayParam]);

	// Parse command text changes from external sources
	useEffect(() => {
		if (isUserEditing.current) return;
		
		const text = context?.commandText || '';
		const parsed = parseCommandText(text);
		if (parsed) {
			setLocalState(prev => ({
				...prev,
				value: parsed.value,
				unit: parsed.unit
			}));
		}
	}, [context?.commandText, parseCommandText]);

	// Event handlers
	const handleUseModalChange = useCallback((checked: boolean) => {
		updateCommand({ useModal: checked }, true); // Immediate update for UI responsiveness
	}, [updateCommand]);

	const handleModalHeaderChange = useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
		isUserEditing.current = true;
		updateCommand({ modalHeaderText: ev.target.value });
		setTimeout(() => { isUserEditing.current = false; }, 500);
	}, [updateCommand]);

	const handleModalBodyChange = useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
		isUserEditing.current = true;
		updateCommand({ modalBodyText: ev.target.value });
		setTimeout(() => { isUserEditing.current = false; }, 500);
	}, [updateCommand]);

	const handleValueChange = useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
		isUserEditing.current = true;
		updateCommand({ value: ev.target.value });
		setTimeout(() => { isUserEditing.current = false; }, 500);
	}, [updateCommand]);

	const handleUnitChange = useCallback((unit: 'ms' | 's' | 'm') => {
		updateCommand({ unit }, true); // Immediate update for better UX
	}, [updateCommand]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			debouncedUpdate.cancel();
		};
	}, [debouncedUpdate]);

	return <>
		<CommandBlockHolder commandType={context?.command.type}>
			<CommandNavigators />
			<CommandBlockBody>
				<CommandBlockScope width='100%'>
					<Box display="flex" gap={1} alignItems="center">
						<InputField
							title={t("waitDuration")}
							sx={{ ...context?.textareaStyle, flex: 1 }}
							value={localState.value}
							onChange={handleValueChange}
						/>
						<FormControl variant="outlined" size="small">
							<Select
								value={localState.unit}
								onChange={(e) => handleUnitChange(e.target.value as 'ms' | 's' | 'm')}
							>
								<MenuItem value="ms">ms</MenuItem>
								<MenuItem value="s">seconds</MenuItem>
								<MenuItem value="m">minutes</MenuItem>
							</Select>
						</FormControl>
					</Box>
				</CommandBlockScope>
				<CommandCheckbox
					value={!!localState.useModal}
					text={t('useAPopup')}
					onChange={handleUseModalChange}
				/>

				{localState.useModal && (
					<>
						<MuiStyledInputContainer>
							<MuiStyledCommandTextField
								label={t('modalHeaderText')}
								sx={{ ...context?.textareaStyle }}
								value={localState.modalHeaderText}
								onChange={handleModalHeaderChange}
							/>
						</MuiStyledInputContainer>

						<MuiStyledInputContainer>
							<MuiStyledCommandTextField
								label={t('modalBodyText')}
								sx={{ ...context?.textareaStyle }}
								value={localState.modalBodyText}
								onChange={handleModalBodyChange}
							/>
						</MuiStyledInputContainer>
					</>
				)}
			</CommandBlockBody>
		</CommandBlockHolder>
	</>
};
