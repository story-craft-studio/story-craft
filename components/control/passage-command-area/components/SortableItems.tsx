import * as React from 'react';
import {useSortable} from '@dnd-kit/sortable';
import {DraggableCommandListItem} from './DraggableCommandListItem';
import {DraggableBreakPoint} from './DraggableBreakPoint';
import {Passage} from "../../../../store/stories";
import {CommandType, PassageCommand} from "../../../../common/passage-command/PassageCommandTypeDef";
import {BreakPoint} from "../../../../../shared/typedef/command-break-points";
import {CSSProperties} from "react";

interface SortableCommandItemProps {
    id: string;
    passage: Passage;
    command: PassageCommand;
    commandIndex: number;
    positionIndex: number;
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

interface SortableBreakPointItemProps {
    id: string;
    breakPoint: BreakPoint;
    positionIndex: number;
    onChange: (ev: any) => void;
    onRemove: (ev: any) => void;
    onMoveUp: (ev: any) => void;
    onMoveDown: (ev: any) => void;
    bgColor?: string;
}

const SortableCommandItemComponent: React.FC<SortableCommandItemProps> = (props) => {
    const {
        id,
        ...otherProps
    } = props;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({id});

    return (
        <DraggableCommandListItem
            attributes={attributes}
            listeners={listeners}
            setNodeRef={setNodeRef}
            transform={transform}
            transition={transition}
            isDragging={isDragging}
            {...otherProps}
        />
    );
};

const SortableBreakPointItemComponent: React.FC<SortableBreakPointItemProps> = (props) => {
    const {
        id,
        ...otherProps
    } = props;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({id});

    return (
        <DraggableBreakPoint
            attributes={attributes}
            listeners={listeners}
            setNodeRef={setNodeRef}
            transform={transform}
            transition={transition}
            isDragging={isDragging}
            {...otherProps}
        />
    );
};

// Memoize components with custom comparison
export const SortableCommandItem = SortableCommandItemComponent;

export const SortableBreakPointItem = SortableBreakPointItemComponent; 