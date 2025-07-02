import * as MuiSystem from "@mui/system";
import {Box} from "@mui/material";


export const AbsoluteBox = MuiSystem.styled(Box, {
	// forwarded all prop(s) to DOM
	shouldForwardProp: (prop) => true,
})((props) => ({
	position: 'absolute',
}));

export const AbsoluteFlexBox = MuiSystem.styled(Box, {
	// forwarded all prop(s) to DOM
	shouldForwardProp: (prop) => true,
})((props) => ({
	position: 'absolute',
	display: 'flex'
}));

export const RelativeBox = MuiSystem.styled(Box, {
	// forwarded all prop(s) to DOM
	shouldForwardProp: (prop) => true,
})((props) => ({
	position: 'relative',
}));


