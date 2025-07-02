import * as React from "react";
import { useState } from "react";
import { Box, Button, Tooltip, Divider, Collapse, Typography } from "@mui/material";
import { ArrowDropUp, ArrowDropDown } from "@mui/icons-material";
import { useComponentTranslation } from "../../../util/translation-wrapper";
import { 
    CommandType, 
    CommandTier, 
    getCommandsByTier, 
    isBasicCommand, 
    isAdvancedCommand 
} from "../PassageCommandTypeDef";
import { getCommandTypeIcon } from "./command-type-icons";
import { commandColors } from "./base-ui";
import { Passage, Story } from "../../../store/stories";
import { addCommandBreakPoint } from "../../../utils/command-break-point-utils";
import { useStoriesContext } from "../../../store/stories/stories-context";

export interface CommandTypeButtonsProps {
    onCommandSelect: (commandType: CommandType) => void;
    excludeTypes?: CommandType[];
    passage?: Passage;
    dispatch?: any;
}

export const CommandTypeButtons: React.FC<CommandTypeButtonsProps> = ({ 
    onCommandSelect,
    excludeTypes = [CommandType.newCommand, CommandType.customCommand],
    passage,
    dispatch
}) => {
    const { t } = useComponentTranslation('commandTypeSelector');
    const [showAdvanced, setShowAdvanced] = useState(false);

    const renderCommandButton = (type: CommandType) => (
        <Tooltip key={type} title={t(type)} placement="top">
            <Button
                variant="contained"
                startIcon={getCommandTypeIcon(type)}
                onClick={() => {
                    onCommandSelect(type)
                }}
                sx={{
                    width: '40px',
                    height: '40px',
                    minWidth: '40px',
                    borderRadius: '10px',
                    padding: 0,
                    backgroundColor: commandColors[type],
                    '& .MuiButton-startIcon': {
                        color: 'white',
                        margin: 0,
                        '& svg': {
                            width: '25px',
                            height: '25px'
                        }
                    },
                    '&:hover': {
                        backgroundColor: commandColors[type],
                        opacity: 0.9
                    }
                }}
            />
        </Tooltip>
    );

    const renderBasicCommands = () => {
        return getCommandsByTier(CommandTier.BASIC)
            .filter(type => !excludeTypes.includes(type))
            .map(type => renderCommandButton(type));
    };

    const renderAdvancedCommands = () => {
        return getCommandsByTier(CommandTier.ADVANCED)
            .filter(type => !excludeTypes.includes(type))
            .map(type => renderCommandButton(type));
    };

    const advancedCommands = getCommandsByTier(CommandTier.ADVANCED)
        .filter(type => !excludeTypes.includes(type));

    return (
        <Box sx={{ 
            p: 0,
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            position: 'relative', // Enable absolute positioning for child
            marginBottom: '4px',  // For the arrow toggle button
        }}>
            {/* Floating Arrow Toggle Button */}
            {advancedCommands.length > 0 && (
                <Button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    sx={{
                        position: 'absolute',
                        bottom: -32,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        minWidth: 'auto',
                        width: '36px',
                        height: '24px',
                        padding: 0,
                        borderRadius: 2,
                        color: '#6b7280',
                        backgroundColor: 'white',
                        border: '1px solid #e0e0e0',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)',
                        zIndex: 10,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                            backgroundColor: '#f9fafb',
                            color: '#374151',
                            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2), 0 3px 6px rgba(0, 0, 0, 0.15)',
                            transform: 'translateX(-50%) translateY(-1px)',
                        },
                        '&:active': {
                            transform: 'translateX(-50%) translateY(0px)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)',
                        },
                        '& svg': {
                            fontSize: '40px',
                            transition: 'transform 0.2s ease-in-out'
                        }
                    }}
                >
                    {showAdvanced ? <ArrowDropUp /> : <ArrowDropDown />}
                </Button>
            )}

            {/* Basic Commands */}
            <Box sx={{ 
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                justifyContent: 'flex-start',
                alignItems: 'center'
            }}>
                {renderBasicCommands()}
            </Box>

            {/* Advanced Commands */}
            {advancedCommands.length > 0 && (
                <Collapse in={showAdvanced}>
                    <Box sx={{ 
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 1,
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        mt: 1,
                        pt: 1,
                        borderTop: '1px solid #e0e0e0'
                    }}>
                        {renderAdvancedCommands()}
                    </Box>
                </Collapse>
            )}
        </Box>
    );
}; 