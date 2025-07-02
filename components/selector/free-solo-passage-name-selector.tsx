import {Autocomplete, Box, SxProps, TextField} from "@mui/material";
import * as React from "react";
import _ from "lodash";
import {useComponentTranslation} from "../../util/translation-wrapper";

type PassageOption = {
	label: string,
}

type FreeSoloPassageTagSelectorProps = {
	allNames, value,
	onChange: (tag: string) => void,

	sx?: SxProps,
	inputSx?: SxProps,
}

export default function FreeSoloPassageNameSelector(props: FreeSoloPassageTagSelectorProps) {
	const {allNames, value, onChange} = props;

	const sx = props.sx || {};
	const inputSx = props.inputSx || {};

	const {tComp} = useComponentTranslation('passageNameSelector');
	const onAutocompleteChangeSelectedName = (ev, newValue: PassageOption | string | null) => {
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
		onChangeSelectedName(selectedNameAsString);
	}

	const onChangeSelectedName = (newSelectedName: string) => {
		onChange(newSelectedName || '');
	}

    return (
	    <Box sx={{display: 'flex', ...sx}} className={'FreeSoloPassageNameSelector'}>
		    <Autocomplete
			    freeSolo
			    options={allNames}
			    onChange={onAutocompleteChangeSelectedName}
			    value={value || ''}
			    renderInput={(params) => <TextField
				    {...params}
				    label={tComp("passageName")}
				    onChange={ev => onChangeSelectedName(ev.target.value)}
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
