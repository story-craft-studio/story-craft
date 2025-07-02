import { Box, Slider, Typography } from "@mui/material";
import * as React from "react";
import { useState } from "react";
import { CharacterSkin, CharacterSkinSettings } from "./character-typedef";
import StringUtil from "../../../../../util/StringUtil";
import { FlexBox } from "../../../../../common/template/mui-template/flex-box";

function toNumber(supposedNumber: any, defaultNumber: number): number {
	//NOTE: the 'isNaN' return 0 when meet a null value,
	if (supposedNumber === null
		|| Number.isNaN(supposedNumber)
		|| Number.isNaN(Number(supposedNumber))
	) {
		return defaultNumber;
	}

	let num: number = Number(supposedNumber);
	if (isNaN(num)) {
		console.error('NO FUCKING WAY', supposedNumber);
	}
	return num;
}

const marks = [
	{
		value: 50,
		label: '50%',
	},
	{
		value: 100,
		label: '100%',
	},
	{
		value: 150,
		label: '150%',
	},
];

const genUid = () => 'CharacterSkinSettings-' + StringUtil.randomString();
export function CharacterSkinSetting(props: {
	eachSkin: CharacterSkin,
	skinIndex: number,
	onChange: (newSettings: CharacterSkinSettings) => void
}) {
	const [uid] = useState(genUid());
	const { eachSkin, skinIndex, onChange } = props;

	const [tempSettings, setTempSettings] = useState<Required<CharacterSkinSettings>>({
		scale: toNumber(eachSkin.settings?.scale, 1),
	})

	const _onChange = (newSettings: Partial<CharacterSkinSettings>) => {
		let newTempSettings = { ...tempSettings };

		let didChange = false;
		Object.entries(newSettings).forEach(entry => {
			let key = entry[0];
			let val = entry[1];
			newTempSettings[key] = val;
			didChange = true;
		});

		if (!didChange) return;

		setTempSettings(newTempSettings);
		props.onChange(newTempSettings);
	}

	return <>
		<FlexBox>
			<Typography gutterBottom sx={{ ...labelStyle, color: 'var(--black)', display: 'block', pr: '15px' }}>
				Zoom(%)
			</Typography>
			<Slider
				value={Math.round(tempSettings.scale * 100)}
				sx={{
					color: "var(--black)",
					"& .MuiSlider-markLabel": {
						color: "var(--black)",
					}
				}}
				max={150}
				min={50}
				valueLabelDisplay="auto"
				getAriaValueText={val => val + '%'}
				marks={marks}
				onChange={ev => _onChange(
					// @ts-ignore
					{ scale: Math.round(Number(ev.target.value)) / 100 }
				)}
			/>
		</FlexBox>
	</>;
}

const labelStyle = { fontSize: '0.8rem' };
