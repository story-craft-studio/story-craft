import * as MuiSystem from "@mui/system";
import {Box, TextField} from "@mui/material";

export const MuiStyledCommandBlockContainer = MuiSystem.styled(Box)(({ theme }) =>({
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  width: '100%',
  height: 'fit-content',
  borderRadius: '10px',
  padding: '10px',
  marginBottom: '10px',
}));

export const MuiStyledCommandContainerBox = MuiSystem.styled(Box)(({ theme }) =>({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  backgroundColor: '#BFF0F5',
  borderRadius: '10px',
  padding: '15px',
  paddingTop: '35px',
  boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
}));

export const MuiStyledCommandTextField = MuiSystem.styled(TextField, {
  // forwarded all prop(s) to DOM
  shouldForwardProp: (prop) => true,
})({
  display: 'flex',
  backgroundColor: "white",
  borderRadius: "8px",
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    height: "40px", // Adjust height
    padding: "0 14px",
    display: "flex",
    alignItems: "center", // Aligns input vertically
    "& input": {
      padding: "14px 12px", // Adjust padding inside input
    },
  },
});

export const MuiStyledInputContainer = MuiSystem.styled(Box, {
  // forwarded all prop(s) to DOM
  shouldForwardProp: (prop) => true,
})({
  '& > div': {
    marginTop: '5px',
    marginBottom: '25px',
  }
});
