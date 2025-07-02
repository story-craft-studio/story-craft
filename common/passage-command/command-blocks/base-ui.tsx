import { Menu, MenuItem, TextField } from "@mui/material";
import { Box, Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import Button from '@mui/material/Button';
import SellIcon from '@mui/icons-material/Sell';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import styled from "styled-components";
import React, { useState } from "react";
import StringUtil from "../../../util/StringUtil";
import { EditButton, RemoveButton } from "./base-ui-buttons";
import { CommandType } from "../PassageCommandTypeDef";

const theme = {
    primaryColor: "#2A75FF", // Blue color from Figma
    bodyNormalColor: "#FFFFFF", // White background
    bodyNewColor: "#FFFFFF", // White background
    titleBackground: "#FFFFFF", // White background
    buttonText: "#000000", // Black text
    buttonBorder: "#2A75FF", // Blue border
    buttonBorderChecked: "#2A75FF", // Blue border
    tagColor: "#FFFFFF", // White text
    tagBgColor: "#2A75FF", // Blue background
};

// Command type specific colors
const commandColors: Record<CommandType, string> = {
    [CommandType.newCommand]: "#cfcfcf",      // Coral red
    [CommandType.tag]: "#5a2dff",      // Coral red
    [CommandType.characterDialog]: "#2A75FF",  // Keep existing blue
    [CommandType.characterShow]: "#3EDF1E",    // Keep existing green
    // [CommandType.characterHide]: "#FFB84D",    // Warm orange
    [CommandType.changeBackground]: "#9B6DFF", // Purple
    [CommandType.customCommand]: "#00B8D4",    // Cyan
    [CommandType.delay]: "#FF8A65",           // Light coral
    [CommandType.clearScreen]: "#FF5252",      // Red
    [CommandType.chooseNextPassage]: "#ff2aed", // Keep existing pink
    [CommandType.jumpToPassageWithTag]: "#ff2aed", // Forest green
    [CommandType.playMusic]: "#fbff0d", // Forest green
    [CommandType.script]: "#000000", // Black
    [CommandType.backgroundEffect]: "#FF9800", // Orange/amber for effects
};

const commandBgColors: Record<CommandType, string> = {
    [CommandType.newCommand]: "#ffffff",      // Light coral red
    [CommandType.tag]: "#cfcfcf",   
    [CommandType.characterDialog]: "#E6F0FF",  // Light blue
    [CommandType.characterShow]: "#E8FFE6",    // Light green
    // [CommandType.characterHide]: "#FFF3E0",    // Light orange
    [CommandType.changeBackground]: "#F2E6FF", // Light purple
    [CommandType.customCommand]: "#E0F7FA",    // Light cyan
    [CommandType.delay]: "#FFE0D6",           // Light light coral
    [CommandType.clearScreen]: "#FFEBEE",      // Light red
    [CommandType.chooseNextPassage]: "#FFE6FC", // Light pink
    [CommandType.jumpToPassageWithTag]: "#FFE6FC", // Light forest green
    [CommandType.playMusic]: "#f8eba0", // Light pink
    [CommandType.script]: "#000000", // Black
    [CommandType.backgroundEffect]: "#FFF3E0", // Light orange/amber
};

export {theme, commandColors};

export enum InputType {
    TEXT = 'text',
    URL = 'url',
    NUMBER = 'number',
    EMAIL = 'email',
    PASSWORD = 'password'
}

export const BodyTheme = {
    DEFAULT: theme.bodyNormalColor,
    NORMAL: theme.bodyNewColor
};


export const RightAnchorGroup = styled.div`
	margin-left: auto;
	padding-right: 10px;
    gap: 8px;
`

export const CommandBlockHolder = styled.div<{ commandType?: CommandType }>`
    display: flex;
    flex-direction: column;
    position: relative;
    width: 100%;
    height: fit-content;
    border-radius: 10px;
    padding: 5px;
    margin-top: 8px;
    background-color: ${props => {
        return props.commandType ? commandBgColors[props.commandType] : theme.bodyNormalColor;
    }};
    border: 4px solid ${props => {
        return props.commandType ? commandColors[props.commandType] : theme.bodyNormalColor;
    }};
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);

    &:hover {
        .command-body-hover-visible {
            display: flex;
        }
    }
`;

export const CommandBlockTitle = styled.div<{ commandType?: CommandType }>`
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    background-color: ${props => props.commandType ? commandColors[props.commandType] : theme.buttonBorder};
    color: ${theme.tagColor};
    border: none;
    border-radius: 10px 0px 10px 0px;
    padding: 5px 10px;
    font-size: 16px;
    min-height: 60px;
    width: fit-content;

    svg {
        color: ${theme.tagColor};
    }

    &:hover {
        background-color: ${props => props.commandType ? commandColors[props.commandType] : theme.buttonBorder};
    }
`;

export const CommandBlockBody = styled.div<{ $variant?: keyof typeof BodyTheme, className?: string }>`
    display: block;
    flex-direction: row;
    justify-content: space-between;
    background-color: transparent;
    border-radius: 10px;
    padding: 5px;
    padding-left: 40px;
    box-shadow: none;
    ${props => props.className || 'command-block-body'}
`;


export const CommandBlockScope = styled.div<{ width?: string }>`
    display: flex;
    width: ${props => props.width || '100%'};
    gap: 10px;
`


export const Label = styled.label`
  font-weight: 100;
  margin-right: 5px;
  color: #000;
`;

export const InputField = function (props: {
    title: string,
    id?: string,
    multiline?: boolean,
    className?: string,
    onChange?: (ev) => void;
    onBlur?: (ev) => void;
    value?: string;
    placeholder?: string;
    sx?: React.CSSProperties
    error?: boolean;
    helperText?: string;
    type?: InputType;
    transparent?: boolean;
}) {
    const [internalError, setInternalError] = useState(false);
    const [internalHelperText, setInternalHelperText] = useState('');

    const handleValidation = (value: string) => {
        if (!props.type) return;

        switch (props.type) {
            case InputType.URL: {
                const urlResult = StringUtil.urlTest(value);
                if (!urlResult.isUrl) {
                    setInternalError(true);
                    setInternalHelperText(urlResult.reason || 'Invalid URL');
                    return;
                }
                break;
            }

            case InputType.NUMBER:
                if (isNaN(Number(value))) {
                    setInternalError(true);
                    setInternalHelperText('Must be a valid number');
                    return;
                }
                break;

            case InputType.EMAIL:
                if (!/\S+@\S+\.\S+/.test(value)) {
                    setInternalError(true);
                    setInternalHelperText('Invalid email format');
                    return;
                }
                break;
        }

        setInternalError(false);
        setInternalHelperText('');
    };

    return (
        <TextField
            id={"outlined-required " + props.id}
            label={props.title}
            className={props.className}
            multiline={props.multiline}
            onChange={(ev) => {
                ev.stopPropagation();
                handleValidation(ev.target.value);
                props.onChange?.(ev);
            }}
            onBlur={(ev) => {
                ev.stopPropagation();
                props.onBlur?.(ev);
            }}
            onKeyDown={(ev: any) => {
                if (!props.multiline && ev.key === 'Enter') {
                    ev.target.blur();
                }
            }}
            value={props.value}
            placeholder={props.placeholder}
            type={props.type}
            error={props.error || internalError}
            helperText={props.helperText || internalHelperText}
            sx={{
                ...(props.multiline ? {} : { height: "40px" }),
                backgroundColor: "white",
                // backgroundColor: props.transparent ? "transparent" : "white",
                borderRadius: "8px",
                "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    ...(props.multiline ? {} : { minHeight: "40px" }),
                    padding: "0 14px",
                    display: "flex",
                    alignItems: props.multiline ? "flex-start" : "center",
                    "& fieldset": {
                        border: "none"
                    },
                    "& input": {
                        padding: "14px 12px",
                    },
                    "& textarea": {
                        padding: "14px 12px",
                    },
                },
                ...props.sx
            }}
        />
    )
}

export const NavigatorBlock = styled.div`
    position: absolute;
    top: 8px;
    right: 20px;
    display: none;
    flex-direction: row;
    gap: 8px;
    background-color: ${theme.primaryColor};
    padding: 5px;
    border-radius: 10px;
    color: ${theme.tagColor};

    &:hover {
        display: flex;
    }
`;

export const InputContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1;
    margin-right: 10px;

    &:last-child {
    margin-right: 0;
    }
`;

export const DialogRow = styled.div`
    display: flex;
    flex-direction: row;
`;


/**
 * 
 * @param props {
 *      value: boolean, initial value
 *      text: string, description text
 *      onChange: Callable(boolean) on value change
 * }
 * 
 * @returns 
 */
export const CommandCheckbox = function (props: {
    value: boolean;
    text: string;
    onChange?: (checked: boolean) => void;
}) {
    return (
        <FormGroup>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={props.value}
                        onChange={(e) => props.onChange?.(e.target.checked)}
                        sx={{
                            color: theme.buttonBorder,
                            '&.Mui-checked': {
                                color: theme.buttonBorderChecked,
                            },
                        }}
                    />
                }
                label={props.text}
                sx={{
                    '& .MuiFormControlLabel-label': {
                        color: theme.buttonText,
                        fontSize: '0.875rem',
                    }
                }}
            />
        </FormGroup>
    );
};



// === DROP DOWN ===

export const DropdownComponent = (props: { options, onChange }) => {

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const ITEM_HEIGHT = 48;

    return (
        <div>
            <Button
                id="demo-customized-button"
                aria-controls={open ? 'demo-customized-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                variant="contained"
                disableElevation
                onClick={handleClick}
                endIcon={<KeyboardArrowDownIcon />}
            >
                Options
            </Button>
            <Menu
                id="long-menu"
                MenuListProps={{
                    'aria-labelledby': 'long-button',
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                slotProps={{
                    paper: {
                        style: {
                            maxHeight: ITEM_HEIGHT * 4.5,
                            width: '20ch',
                        },
                    },
                }}
            >
                {props.options.map((option) => (
                    <MenuItem key={option} selected={option === 'Pyxis'} onClick={handleClose}>
                        {option}
                    </MenuItem>
                ))}
            </Menu>
        </div>
    );
}
