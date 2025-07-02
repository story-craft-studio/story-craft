import React from 'react'
import TextField, { type TextFieldProps } from '@mui/material/TextField'

type ColorTextFieldProps = TextFieldProps

const ColorTextField = React.forwardRef(
  (props: ColorTextFieldProps, ref: React.ForwardedRef<HTMLDivElement>) => {
    const { className, ...restTextFieldProps } = props

    return (
      <TextField
        className={`MuiColorInput-TextField ${className || ''}`}
        ref={ref}
        {...restTextFieldProps}
      />
    )
  }
)

export default ColorTextField
