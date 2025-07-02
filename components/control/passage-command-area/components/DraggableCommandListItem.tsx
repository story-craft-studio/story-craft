import * as React from 'react';
import {CSS} from '@dnd-kit/utilities';
import {CommandListItem} from "../CommandListItem";
import {Passage} from "../../../../store/stories";
import {CommandType, PassageCommand} from "../../../../common/passage-command/PassageCommandTypeDef";
import {CSSProperties} from "react";

interface DraggableCommandListItemProps {
    passage: Passage;
    command: PassageCommand;
    commandIndex: number;
    positionIndex: number;
    attributes: any;
    listeners: any;
    setNodeRef: (node: HTMLElement | null) => void;
    transform: any;
    transition: string | undefined;
    isDragging: boolean;
    addCmd: (commandIndex: number) => void;
    cloneCmd: (commandIndex: number) => void;
    moveUp: (cmdIdx: number, posIdx: number) => void;
    moveDown: (cmdIdx: number, posIdx: number) => void;
    moveCommandListItemToIdx: (moveToIdx: number, fromIdx: number) => void;
    textareaId: string;
    textareaStyle: CSSProperties;
    onChangeText: (text: string) => void;
    deleteCmd: (cmdIndex: number) => void;
    changeCommandType: (i: number, cmdType: CommandType) => void;
    editWholeCommandAtIndex: (index: number, newCommand: PassageCommand) => void;
    useCodeMirror: boolean;
    otherProps: any;
    handleCodeMirrorBeforeChange: (editor: any, data: any, text: string) => void;
}

const DraggableCommandListItemComponent: React.FC<DraggableCommandListItemProps> = (props) => {
    const {
        passage,
        command,
        commandIndex,
        positionIndex,
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
        addCmd,
        cloneCmd,
        moveUp,
        moveDown,
        moveCommandListItemToIdx,
        textareaId,
        textareaStyle,
        onChangeText,
        deleteCmd,
        changeCommandType,
        editWholeCommandAtIndex,
        useCodeMirror,
        otherProps,
        handleCodeMirrorBeforeChange
    } = props;

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style} 
            className={`draggable-item ${isDragging ? 'dragging' : ''}`}
        >
            <div className="drag-handle" {...attributes} {...listeners}></div>
            <CommandListItem
                passage={passage}
                command={command}
                positionIndex={positionIndex}
                commandIndex={commandIndex}
                addCmd={addCmd}
                cloneCmd={cloneCmd}
                moveUp={moveUp}
                moveDown={moveDown}
                moveCommandListItemToIdx={moveCommandListItemToIdx}
                textareaId={textareaId}
                textareaStyle={textareaStyle}
                onChangeText={onChangeText}
                deleteCmd={deleteCmd}
                changeCommandType={changeCommandType}
                editWholeCommandAtIndex={editWholeCommandAtIndex}
                useCodeMirror={useCodeMirror}
                otherProps={otherProps}
                handleCodeMirrorBeforeChange={handleCodeMirrorBeforeChange}
            />
        </div>
    );
};

export const DraggableCommandListItem = DraggableCommandListItemComponent;
// React.memo(DraggableCommandListItemComponent, (prevProps, nextProps) => {
//     // Only re-render if command content, position, or essential props actually changed
//     return (
//         prevProps.command?.id === nextProps.command?.id &&
//         prevProps.command?.type === nextProps.command?.type &&
//         prevProps.command?.content?.text === nextProps.command?.content?.text &&
//         prevProps.positionIndex === nextProps.positionIndex &&
//         prevProps.commandIndex === nextProps.commandIndex &&
//         prevProps.isDragging === nextProps.isDragging &&
//         prevProps.useCodeMirror === nextProps.useCodeMirror
//     );
// }); 