import * as React from 'react';
import {CSS} from '@dnd-kit/utilities';
import {CommandBreakPointComponent} from "../../../../common/template/mui-template/command-break-point-component";
import {BreakPoint} from "../../../../../shared/typedef/command-break-points";

interface DraggableBreakPointProps {
    breakPoint: BreakPoint;
    positionIndex: number;
    attributes: any;
    listeners: any;
    setNodeRef: (node: HTMLElement | null) => void;
    transform: any;
    transition: string | undefined;
    isDragging: boolean;
    onChange: (ev: any) => void;
    onRemove: (ev: any) => void;
    onMoveUp: (ev: any) => void;
    onMoveDown: (ev: any) => void;
    bgColor?: string;
}

const DraggableBreakPointComponent: React.FC<DraggableBreakPointProps> = (props) => {
    const {
        breakPoint,
        positionIndex,
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
        onChange,
        onRemove,
        onMoveUp,
        onMoveDown,
        bgColor
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
            <CommandBreakPointComponent
                bgColor={bgColor}
                value={breakPoint.name}
                collapsible={true}
                editable={true}
                onChange={onChange}
                onRemove={onRemove}
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
            />
        </div>
    );
};

export const DraggableBreakPoint = DraggableBreakPointComponent; 