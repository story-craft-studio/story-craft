import {Autocomplete, Box, SxProps, TextField} from "@mui/material";
import * as React from "react";
import {useEffect, useState} from "react";
import _ from "lodash";
import {useComponentTranslation} from "../../util/translation-wrapper";

const getAllPassageTags = (): PassageOption[] => {
	return [{label: 'hi'}];
}


type PassageOption = {
	label: string,
}

type FreeSoloPassageTagSelectorProps = {
	allTags, value,
	onChange: (tag: string) => void,
	sx?: SxProps,
	inputSx?: SxProps,
}

export default function FreeSoloPassageTagSelector(props: FreeSoloPassageTagSelectorProps) {
	const {allTags, value, onChange} = props;

	const sx = props.sx || {};
	const inputSx = props.inputSx || {};

	const {tComp} = useComponentTranslation('passageTagSelector');
	const onAutocompleteChangeSelectedTag = (ev, newValue: PassageOption | string | null) => {
		let selectedTagAsString: string;
		if (!newValue) {
			selectedTagAsString = '';
		}
		else if (_.isString(newValue)) {
			selectedTagAsString = newValue;
		}
		else {
			selectedTagAsString = newValue.label || '';
		}
		onChangeSelectedTag(selectedTagAsString);
	}
	const onChangeSelectedTag = (newSelectedTag: string) => {
		console.log('onChangeSelectedTag', newSelectedTag);
		onChange(newSelectedTag || '');
	}

    return (
	    <Box sx={{display: 'flex', ...sx}} className={'FreeSoloPassageTagSelector'}>
		    <Autocomplete
			    freeSolo
			    options={allTags}
			    onChange={onAutocompleteChangeSelectedTag}
			    value={value || ''}
			    renderInput={(params) => <TextField
				    {...params}
				    label={tComp("passageName")}
				    onChange={ev => onChangeSelectedTag(ev.target.value)}
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
