import React from "react";
import * as MuiSystem from "@mui/system";
import {Card, TextField, Box, CardContent, Typography} from "@mui/material";


export const TwineSettingGroupCard = MuiSystem.styled(Card, {
	// forwarded all prop(s) to DOM
	shouldForwardProp: (prop) => true,
})({
	margin: '15px 5px',
	overflow: 'unset',
});

export const TwineSettingGroupCardContent = MuiSystem.styled(CardContent, {
	// forwarded all prop(s) to DOM
	shouldForwardProp: (prop) => true,
})({
});


export const TwineSettingGroupCardAction = MuiSystem.styled(CardContent, {
	// forwarded all prop(s) to DOM
	shouldForwardProp: (prop) => true,
})({
});


export const TwineSettingFormGroup = MuiSystem.styled(Box, {
	// forwarded all prop(s) to DOM
	shouldForwardProp: (prop) => true,
})({
});

export const TwineFieldLabel = (props: any) => {
	return <Box sx={{
		width: '30%',
	}}>
		<Box sx={{
			height: '45px',
			lineHeight: '45px',
			textAlign: 'left',
		}}>
			<Typography
				component={'span'}
				sx={{
					display: 'inline-block',
					verticalAlign: 'middle',
					lineHeight: 'normal',
				}}
				{...props}
			/>
		</Box>
	</Box>
}
