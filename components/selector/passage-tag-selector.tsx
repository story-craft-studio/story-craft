import * as React from "react";
import {useEffect, useState} from "react";
import _ from "lodash";
import {Box, FormControl, MenuItem, Select, SelectChangeEvent, SxProps} from "@mui/material";
import {Passage} from "../../store/stories";
import EvtMgr, {EventName} from "../../common/evt-mgr";

export function PassageTagSelector(props: {
	allTags: string[],
	value: string,
	onChange: (tag: string) => void,
	getMenuItem?: (each) => React.JSX.Element,
	getMenuItemClass?: (pName: string) => string,
	sx?: SxProps,
	selectSx?: SxProps,
}) {

	const [allTags, setAllTags] = useState<string[]>(props.allTags);
	useEffect(() => {
		setAllTags(Array.from(new Set(props.allTags)));
	}, [props.allTags]);


	const isInvalid = () => {
		let noTagAvailable = !allTags?.length && !props.value;
		if (noTagAvailable) return false;

		let tagAvailableAndMatchedValue = allTags.some(someT => someT === props.value);
		if (tagAvailableAndMatchedValue) return false;

		return true;
	}

	useEffect(() => {
		if (isInvalid()) {
			console.log('invalid tag', props.value, 'will change to ', allTags[0]);
			handleChange(allTags[0] || '');
			return
		}

		if (props.value !== props.value)
			handleChange(props.value || '');

	}, [allTags, props.value])

	const triggerParentChange = (ev: SelectChangeEvent) => {
		handleChange(ev.target.value);
	}

	const handleChange = (newValue: string) => {
		console.log('PassageTagSelector try change to ', newValue);

		//try not to nest the if-block too much, keep it like this is already hard enough..
		if (!allTags.length && !props.value) {
			return;
		}

		if (!allTags.length && props.value) {
			props.onChange(newValue);
			return;
		}

		let tagAvailableAndMatchedValue = allTags.some(someT => someT === newValue);
		if (!tagAvailableAndMatchedValue) {
			console.error('handleChange got invalid value! Expect one of ', allTags, 'or empty. Got', newValue);
			return;
		}
		props.onChange(newValue);
	}

	let menuItemClass = '';
	if (_.isFunction(props.getMenuItemClass)) {
		menuItemClass = props.getMenuItemClass(props.value) || '';
	}

	let sx: SxProps = props.sx || {};
	let selectSx: SxProps = props.selectSx || {};
	return (
		<Box className="dropdown" sx={sx}>
			{
				isInvalid() ? <i>Hang on..</i>
					: <FormControl variant="outlined" sx={{width: '100%'}}>
						<Select
							value={props.value}
							onChange={triggerParentChange}
							sx={selectSx}
						>
							{
								allTags.map(tag => {
									if (_.isFunction(props.getMenuItem)) {
										return <React.Fragment key={tag}>
											{props.getMenuItem(tag)}
										</React.Fragment>
									}

									return <MenuItem value={tag} className={menuItemClass} key={tag}>
										{tag}
									</MenuItem>
								})
							}
						</Select>
					</FormControl>
			}
		</Box>
	)
}
