import { Box, FormControl, InputLabel, MenuItem, Select, Typography } from "@mui/material";
import _ from "lodash";
import { ReactNode } from "react";

export type SimpleSelectProps = {
	options: string[],
	label?: string,
	getDisplayName?: (option: string) => string,
	getIcon?: (option: string) => ReactNode,
	value?: string,
	onChange?: (ev, option: string, optionIndex: number) => void;
}

export default function SimpleSelect(props: SimpleSelectProps) {
	const { options } = props;
	const uniqOptions = _.uniq(options);

	// @ts-ignore
	let getDisplayName: (option: string) => string = props.getDisplayName;
	if (!_.isFunction(getDisplayName)) {
		getDisplayName = (o) => (o + '');
	}

	const handleChange = (ev) => {
		if (!_.isFunction(props.onChange)) {
			return;
		}

		let pickedOption = ev.target.value;
		let pickedOptionIndex = options.findIndex(o => o === pickedOption);
		props.onChange(ev, pickedOption, pickedOptionIndex)
	}

	// console.log('SimpleSelect rerender with props.value', props.value);
	return (
		<FormControl fullWidth>
			<InputLabel id="simple-select-label">{props.label}</InputLabel>
			<Select
				value={props.value || ''}
				label={props.label || ''}
				onChange={handleChange}
				sx={{
					width: '90%',
					height: '40px',
					backgroundColor: 'white'
				}}
			>
				{
					uniqOptions.map(eachO => {
						const icon = props.getIcon ? props.getIcon(eachO) : null;
						return (
							<MenuItem key={eachO} value={eachO}>
								<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
									{icon}
									{getDisplayName(eachO)}
								</Box>
							</MenuItem>
						)
					})
				}
			</Select>
		</FormControl>
	)
}
