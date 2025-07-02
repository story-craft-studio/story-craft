import React from 'react';
import ChatIcon from '@mui/icons-material/Chat';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import ListIcon from '@mui/icons-material/List';
import MoveDownIcon from '@mui/icons-material/MoveDown';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ImageIcon from '@mui/icons-material/Image';
import CodeIcon from '@mui/icons-material/Code';
import {IconClock, IconMusic, IconWand, IconEraser} from "@tabler/icons";
import {CommandType} from "../PassageCommandTypeDef";
import SellIcon from '@mui/icons-material/Sell';


export const getCommandTypeIcon = (type: CommandType): React.JSX.Element => {
    switch (type) {
        case CommandType.characterDialog:
            return <ChatIcon />;
        case CommandType.characterShow:
            return <DirectionsRunIcon />;
        case CommandType.chooseNextPassage:
            return <ListIcon />;
        case CommandType.changeBackground:
            return <ImageIcon />;
        case CommandType.delay:
            return <IconClock />;
        case CommandType.jumpToPassageWithTag:
            return <MoveDownIcon />;
        case CommandType.customCommand:
            return <IconWand />;
        case CommandType.tag:
            return <SellIcon />
        case CommandType.playMusic:
            return <IconMusic color="#303100" />
        case CommandType.clearScreen:
            return <IconEraser />
        case CommandType.script:
            return <CodeIcon />
        case CommandType.backgroundEffect:
            return <AutoFixHighIcon />
        default:
            return <AutoAwesomeIcon />;
    }
}; 