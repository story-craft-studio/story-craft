import * as React from "react";
import { CommandBlockBody, CommandBlockHolder } from "./base-ui";
import { CommandType } from "../PassageCommandTypeDef";
import { CommandTypeButtons } from "./command-type-buttons";
import styled from "styled-components";
import { Passage } from "../../../store/stories";
import { useUndoableStoriesContext } from "../../../store/undoable-stories";

const StyledArea = styled.button`
    width: 100%;
    background: transparent; /* Light green background */
    border: 3px dashed #7d7d7d; /* Dashed border */
    border-radius: 12px; /* Rounded edges */
    padding: 12px 0px; /* Padding for height and width */
    font-size: 16px; /* Adjust text size */
    color: #7d7d7d; /* Text color matches border */
    text-align: center; /* Center the text */
    cursor: pointer; /* Pointer cursor on hover */
    opacity: 60%;
    transition: background-color 0.2s;

    &:hover {
        background-color: #e6fff1; /* Slightly darker green on hover */
        opacity: 100%;
    }
`;

export interface AddNewBlockProps {
    onAddBlock: (commandType: CommandType) => void;
    passage?: Passage;
}

export const AddNewBlock: React.FC<AddNewBlockProps> = (props) => {
    const { onAddBlock, passage } = props;
    const { dispatch } = useUndoableStoriesContext();

    const handleCommandSelect = (commandType: CommandType) => {
        onAddBlock(commandType);
    };

    return (
        <CommandBlockHolder>
            <StyledArea>
                <CommandBlockBody $variant="NORMAL">
                    <CommandTypeButtons 
                        onCommandSelect={handleCommandSelect} 
                        passage={passage}
                        dispatch={dispatch}
                    />
                </CommandBlockBody>
            </StyledArea>
        </CommandBlockHolder>
    );
};
