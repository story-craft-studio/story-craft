import * as MuiSystem from "@mui/system";
import {Box, Button} from "@mui/material";


export const FullWidthButton = MuiSystem.styled(Button, {
	// forwarded all prop(s) to DOM
	shouldForwardProp: (prop) => true,
})((props) => ({
	width: '100%',
	backgroundColor: 'white'
}));
