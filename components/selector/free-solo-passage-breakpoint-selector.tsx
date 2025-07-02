import {Autocomplete, Box, SxProps, TextField} from "@mui/material";
import * as React from "react";
import _ from "lodash";
import {useComponentTranslation} from "../../util/translation-wrapper";
import {Passage} from "../../store/stories";
import {useEffect, useState} from "react";
import {BreakPoint, CommandBreakPoints} from "../../../shared/typedef/command-break-points";

type FreeSoloPassageTagSelectorProps = {
	passage: Passage | undefined,
	value: string,
	onChange: (tag: string) => void,

	onCommandBreakPointsChange?: (newCommandBreakPoints: CommandBreakPoints) => void,
	sx?: SxProps,
	inputSx?: SxProps,
}

type BreakPointSelectOption = {
	label: string,
}

export default function FreeSoloPassageBreakpointSelector(props: FreeSoloPassageTagSelectorProps) {
	const { value, onChange} = props;
	const passage = props.passage;
	const sx = props.sx || {};
	const inputSx = props.inputSx || {};

	const {tComp} = useComponentTranslation('passageBreakpointSelector');

	const [allBPOptions, setAllBPOptions] = useState<BreakPointSelectOption[]>([]);
	useEffect(() => {
		if (!passage?.commandBreakPoint) {
			setAllBPOptions([]);
			if (_.isFunction(props.onCommandBreakPointsChange)) {
				props.onCommandBreakPointsChange(new CommandBreakPoints());
			}
			return;
		}

		let newCommandBreakPoints: CommandBreakPoints;
		if (passage.commandBreakPoint instanceof  CommandBreakPoints) {
			newCommandBreakPoints = passage.commandBreakPoint;
		}
		else if (typeof passage.commandBreakPoint === 'object') {
			newCommandBreakPoints = CommandBreakPoints.fromRaw(passage.commandBreakPoint);
		}
		else {
			console.error('WTF is ', passage.commandBreakPoint, passage);
			newCommandBreakPoints = new CommandBreakPoints();
		}

		let newAllBPOptions = newCommandBreakPoints.getAllNames()
			.sort((nameA, nameB) => {
				return nameA.localeCompare(nameB);
			})
			.map(eachName => {
				return {label: eachName}
			})

		setAllBPOptions(newAllBPOptions);

		if (_.isFunction(props.onCommandBreakPointsChange)) {
			props.onCommandBreakPointsChange(newCommandBreakPoints);
		}
	}, [passage?.commandBreakPoint]);

	const onAutocompleteChangeSelectedName = (ev, newValue: BreakPointSelectOption | string | null) => {
		let selectedNameAsString: string;
		if (!newValue) {
			selectedNameAsString = '';
		}
		else if (_.isString(newValue)) {
			selectedNameAsString = newValue;
		}
		else {
			selectedNameAsString = newValue.label || '';
		}
		onChangeSelectedPassageName(selectedNameAsString);
	}

	const onChangeSelectedPassageName = (newSelectedName: string) => {
		onChange(newSelectedName || '');
	}

    return (
	    <Box sx={{display: 'flex', ...sx}} className={'FreeSoloPassageBreakpointSelector'}>
		    <Autocomplete
			    freeSolo
			    options={allBPOptions}
			    onChange={onAutocompleteChangeSelectedName}
			    value={value || ''}
			    renderInput={(params) => <TextField
				    {...params}
				    label={tComp("breakPoint")}
				    onChange={ev => onChangeSelectedPassageName(ev.target.value)}
				    size="small"
			    />}

				 sx={{
				     p: 0,
				     width: '100%',
					 ...inputSx
			     }}
		    />
	    </Box>
    )
}
