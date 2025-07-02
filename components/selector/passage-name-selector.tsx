import * as React from "react";
import {useEffect, useState} from "react";
import _ from "lodash";
import {Box, FormControl, MenuItem, Select, SelectChangeEvent, SxProps} from "@mui/material";
import {Passage} from "../../store/stories";
import EvtMgr, {EventName} from "../../common/evt-mgr";

export function PassageNameSelector(props: {
	allPassages: Passage[],
	value?: string,
	onChange?: (ev) => void,
	getMenuItem?: (each) => React.JSX.Element,
	getMenuItemClass?: (pName: string) => string,
	selectSx?: SxProps,
	sx?: SxProps,
}) {

	const [allPassagesName, setAllPassagesName] = useState<string[]>(_.uniq(props.allPassages.map(eachP => eachP.name)));
	useEffect(() => {
		setAllPassagesName(_.uniq(props.allPassages.map(eachP => eachP.name)));
	}, [props.allPassages]);

	const [value, setValue] = useState<string>(props.value || '');
	useEffect(() => {
		setValue(props.value || '');
	}, [props.value]);

	useEffect(() => {
		let someMatchedValue = !value || props.allPassages.some(someP => someP.name === value);
		if (!someMatchedValue) {
			console.warn('invalid name ', value, 'will change to ', props.allPassages[0].name);
			handleChange(props.allPassages[0].name);
			return;
		}
	}, [value]);

	const triggerParentChange = (ev: SelectChangeEvent) => {
		if (_.isFunction(props.onChange)) {
			props.onChange(ev);
			return;
		}

		handleChange(ev.target.value);
	}
	const handleChange = (newValue) => {
		let someMatchedValue = props.allPassages.some(someP => someP.name === newValue);
		if (!someMatchedValue) {
			return;
		}

		setValue(newValue);
	}


	const onPassageNameChangeEvent = ({from, to}) => {
		if (value === from) {
			handleChange(to);
			return;
		}
	}

	useEffect(() => {
		EvtMgr.on(EventName.passageNameChange, onPassageNameChangeEvent);
		return () => {
			EvtMgr.off(EventName.passageNameChange, onPassageNameChangeEvent);
		}
	}, []);

	let menuItemClass = '';
	if (_.isFunction(props.getMenuItemClass)) {
		menuItemClass = props.getMenuItemClass(value) || '';
	}

	let sx: SxProps = props.sx || {};
	let selectSx: SxProps = props.selectSx || {};
	return (
		<Box className="dropdown" sx={sx}>

			<FormControl variant="outlined">
				<Select
					value={value}
					onChange={triggerParentChange}
					sx={selectSx}
				>
					{
						allPassagesName.map(pName => {
							if (_.isFunction(props.getMenuItem)) {
								return <React.Fragment key={pName}>
									{props.getMenuItem(pName)}
								</React.Fragment>
							}

							return <MenuItem value={pName} className={menuItemClass} key={pName}>
								{pName}
							</MenuItem>
						})
					}
				</Select>
			</FormControl>

		</Box>
	)
}
