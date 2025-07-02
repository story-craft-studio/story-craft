import React from 'react'
import { BG_IMAGE_FALLBACK } from '../constants/styles'
import type { ButtonProps } from '@mui/material/Button'
import { Styled } from './ColorButton.styled'

export type ColorButtonProps = Omit<ButtonProps, 'children'> & {
  bgColor: string
  isBgColorValid: boolean
  disablePopover: boolean
}

export type ColorButtonElement = (props: ColorButtonProps) => JSX.Element

const ColorButton = (props: ColorButtonProps) => {
  const {
    bgColor,
    className,
    disablePopover,
    isBgColorValid,
    ...restButtonProps
  } = props

  return (
    <Styled.Button
      disableTouchRipple
      style={{
        backgroundColor: isBgColorValid ? bgColor : undefined,
        backgroundImage: isBgColorValid ? undefined : BG_IMAGE_FALLBACK,
        cursor: disablePopover ? 'default' : undefined
      }}
      className={`MuiColorInput-Button ${className || ''}`}
      variant="text"
      disableElevation={false}
      {...restButtonProps}
    />
  )
}

export default ColorButton
