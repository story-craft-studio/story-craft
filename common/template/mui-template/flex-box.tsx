import * as MuiSystem from "@mui/system";
import {Box, Typography, TypographyOwnProps} from "@mui/material";


export const FlexBox = MuiSystem.styled(Box, {
	// forwarded all prop(s) to DOM
	shouldForwardProp: (prop) => true,
})((props) => ({
	display: 'flex',
}));

export const FlexCenterBox = MuiSystem.styled(Box, {
	// forwarded all prop(s) to DOM
	shouldForwardProp: (prop) => true,
})((props) => ({
	justifyContent: 'center',
	display: 'flex',
}));

export const AutoVerticalAlignTypography = (props: TypographyOwnProps) => {

	let propsSx = props.sx || {};

	return <Typography
		className={'AutoVerticalAlignTypography'}
		component={'div'}
		{...props}
		sx={{
			mt: 'auto', mb: 'auto',
			...propsSx
		}}
	/>
}

