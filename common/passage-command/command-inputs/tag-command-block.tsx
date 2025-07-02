import * as React from "react";
import { useContext } from "react";
import { CommandListItemContext } from "../../../components/control/passage-command-area/CommandListItemContext";
import {
    BodyTheme,
    CommandBlockBody,
    CommandBlockHolder,
} from "../command-blocks/base-ui";
import { CommandType } from "../PassageCommandTypeDef";
import CommandNavigators from "../../../components/control/passage-command-area/CommandNavigators";
import { TextField, Box, Typography } from "@mui/material";

export default function TagCommandBlock() {
    const context = useContext(CommandListItemContext);

    const handleTagChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newTagValue = event.target.value;
        
        if (context?.editWholeCommand && context?.command) {
            const updatedCommand = {
                ...context.command,
                content: {
                    ...context.command.content,
                    tag: newTagValue
                }
            };
            context.editWholeCommand(updatedCommand);
        }
    };

    const currentTag = context?.command?.content?.tag || '';

    return (
        <CommandBlockHolder commandType={CommandType.tag}>
            <CommandNavigators />
            <CommandBlockBody $variant="NORMAL">
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        Tag Command
                    </Typography>
                    <TextField
                        label="Tag Name"
                        value={currentTag}
                        onChange={handleTagChange}
                        variant="outlined"
                        size="small"
                        placeholder="Enter tag name..."
                        helperText="This tag can be used as a reference point for jumps and breakpoints"
                        fullWidth
                    />
                </Box>
            </CommandBlockBody>
        </CommandBlockHolder>
    );
} 