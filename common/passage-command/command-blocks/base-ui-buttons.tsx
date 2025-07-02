import CloseIcon from "@mui/icons-material/Close";
import BorderColorIcon from '@mui/icons-material/BorderColor';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import styled from "styled-components";
import {useTranslation} from "react-i18next";
import {theme} from "./base-ui";

export const IconButton = styled.div<{ theme: { backgroundColor?: string, color?: string } }>`
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    width: 24px;
    height: 24px;
    padding: 4px;
    background-color: ${props => props?.theme?.backgroundColor || theme.tagBgColor};
    color: ${props => props?.theme?.color || theme.tagColor};
    position: relative;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        transform: scale(1.1);
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
    }

    &::after {
        content: attr(data-tooltip);
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-110%) translateY(0%);
        padding: 5px 10px;
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        border-radius: 4px;
        font-size: 12px;
        white-space: nowrap;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.2s, visibility 0.2s;
        z-index: 9999;
    }

    &:hover::after {
        opacity: 1;
        visibility: visible;
    }
`

export const RemoveButton = function ({ onPointerDown }) {
    const {t} = useTranslation();
    return (
        <IconButton
            theme={{
                backgroundColor: theme.tagBgColor,
                color: theme.tagColor,
            }}
            onPointerDown={onPointerDown}
            data-tooltip={t('common.tooltip.remove')}
        >
            <DeleteIcon sx={{ fontSize: '16px' }} />
        </IconButton>
    )
}

export const AddCommandButton = function ({ onPointerDown }) {
    const {t} = useTranslation();
    return (
        <IconButton
            theme={{
                backgroundColor: theme.tagBgColor,
                color: theme.tagColor,
            }}
            onPointerDown={onPointerDown}
            data-tooltip={t('common.tooltip.add')}
        >
            <AddIcon sx={{ fontSize: '16px' }} />
        </IconButton>
    )
}

export const CloneCommandButton = function ({ onPointerDown }) {
    const {t} = useTranslation();
    return (
        <IconButton
            theme={{
                backgroundColor: theme.tagBgColor,
                color: theme.tagColor,
            }}
            onPointerDown={onPointerDown}
            data-tooltip={t('common.tooltip.clone')}
        >
            <ContentCopyIcon sx={{ fontSize: '16px' }} />
        </IconButton>
    )
}

export const MoveUpButton = function ({ onPointerDown }) {
    const {t} = useTranslation();
    return (
        <IconButton
            theme={{
                backgroundColor: theme.tagBgColor,
                color: theme.tagColor,
            }}
            onPointerDown={onPointerDown}
            data-tooltip={t('common.tooltip.moveUp')}
        >
            <KeyboardDoubleArrowUpIcon sx={{ fontSize: '16px' }} />
        </IconButton>
    )
}

export const MoveDownButton = function ({ onPointerDown }) {
    const {t} = useTranslation();
    return (
        <IconButton
            theme={{
                backgroundColor: theme.tagBgColor,
                color: theme.tagColor,
            }}
            onPointerDown={onPointerDown}
            data-tooltip={t('common.tooltip.moveDown')}
        >
            <KeyboardDoubleArrowDownIcon sx={{ fontSize: '16px' }} />
        </IconButton>
    )
}

export const EditButton = function ({ onPointerDown }) {
    const {t} = useTranslation();
    return (
        <IconButton
            theme={{
                backgroundColor: theme.tagBgColor,
                color: theme.tagColor,
            }}
            onPointerDown={onPointerDown}
            data-tooltip={t('common.tooltip.edit')}
        >
            <BorderColorIcon sx={{ fontSize: '16px' }} />
        </IconButton>
    )
}