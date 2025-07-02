import React from 'react'
import Popover, { type PopoverProps } from '@mui/material/Popover'
import { Styled } from './ColorPopover.styled'

type ColorPopoverProps = PopoverProps & {
  position?: 'start' | 'end'
  children: React.ReactNode
}

const ColorPopover = ({
  children,
  className,
  position = 'start',
  ...restPopoverProps
}: ColorPopoverProps) => {
  return (
    <Popover
      className={`MuiColorInput-Popover ${className || ''}`}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: position === 'start' ? 'left' : 'right'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: position === 'start' ? 'left' : 'right'
      }}
      {...restPopoverProps}
    >
      <Styled.Container>{children}</Styled.Container>
    </Popover>
  )
}

export default ColorPopover
