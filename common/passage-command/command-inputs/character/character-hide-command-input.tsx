import * as React from "react";
import {useEffect, useState} from "react";
import {CommandBlockBody, CommandBlockHolder} from "../../command-blocks/base-ui";
import {CommandListItemContext} from "../../../../components/control/passage-command-area/CommandListItemContext";
import CommandNavigators from "../../../../components/control/passage-command-area/CommandNavigators";
import {useCommonTranslation, useComponentTranslation} from "../../../../util/translation-wrapper";
import {Autocomplete, Box, TextField} from "@mui/material";
import EvtMgr, {EventName} from "../../../evt-mgr";
import {CharacterMgr} from "../../../../routes/story-edit/toolbar/settings/character-settings/character-mgr";
import StringUtil from "../../../../util/StringUtil";
import {CommandListItemContextType} from "../CommandInputTypeDefs";
import {MuiAutoCompleteHideLabelLike, HideCharOption} from "../../../../../shared/typedef/character-command-inputs-typedef";
import _ from "lodash";


const genUid = (context?: CommandListItemContextType) => {
	let pid = context?.passage?.id || StringUtil.randomString();
	let cIndex = context?.commandIndex || StringUtil.randomString();
	return `CharacterHideCommandBlock-${pid}-${cIndex}-${StringUtil.randomString()}`;
}

export default function CharacterHideCommandInput() {

	const context = React.useContext(CommandListItemContext);
	const [uid] = useState(genUid(context))

	const { tCommon } = useCommonTranslation();
	const { tComp } = useComponentTranslation('characterHideCommandBlock');


	const onAutocompleteChangeCharacterToHide = (ev, newValue: MuiAutoCompleteHideLabelLike | string | null) => {
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
		// console.log('CharacterHide: onChangeInnerTextField', selectedAsString);
		if (!context?.command) return;

		let selectedHideOption: HideCharOption = 'byExactName';
		allOptions.some(someOption => {
			let matched = someOption.label === selectedAsString
								|| someOption.label.trim().toLowerCase() === selectedAsString;
			if (matched) {
				selectedHideOption = someOption.hideOption;
				return true;
			}
			return false;
		})

		let oldContent = context.command?.content || {};

		let newContent = {
			...oldContent,
			toHideTarget: selectedAsString,
			toHideOption: selectedHideOption,
		}

		context.editWholeCommand({
			...context.command,
			content: { ...newContent },
		})
	}

	const [allOptions, setAllOptions] = useState<MuiAutoCompleteHideLabelLike[]>([]);
	const reloadAllCharacterNames = () => {
		let allCharNames: MuiAutoCompleteHideLabelLike[] = CharacterMgr.getAlls().map((each, index) => {
			return {label: each.displayName, hideOption: 'byExactName'};
		}) || [];

		let newAllOptions = allCharNames;
		newAllOptions.push({
			label: tCommon('hideAll'),
			hideOption: 'all',
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

	let curAutocompleteValue: MuiAutoCompleteHideLabelLike = {
		label: context?.command?.content?.toHideTarget || '',
		hideOption: context?.command?.content?.toHideOption,
	};

	return (
		<CommandBlockHolder>
			<CommandNavigators />

			<CommandBlockBody>
				<Box sx={{display: 'flex'}}>
					<Autocomplete
						freeSolo
						autoComplete

						options={allOptions}
						onChange={onAutocompleteChangeCharacterToHide}
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
							width: '45%',
							backgroundColor: 'white',
							'& .MuiAutocomplete-inputRoot': {
								padding: '0 14px'
							}
						}}
					/>
				</Box>
			</CommandBlockBody>
		</CommandBlockHolder>
	);
}

