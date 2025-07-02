import {useSensors, useSensor, PointerSensor, DragEndEvent} from '@dnd-kit/core';
import PassageCommandPositionTracker from '../passage-command-position-tracker';
import { CommandBreakPoints } from '../../../../../shared/typedef/command-break-points';
import { PassageCommand } from '../../../../common/passage-command/PassageCommandTypeDef';

interface UseDragAndDropProps {
    positionTracker: PassageCommandPositionTracker;
    updateState: (newCommands: PassageCommand[], newCommandBreakPoint: CommandBreakPoints) => void;
}

export const useDragAndDrop = ({ positionTracker, updateState }: UseDragAndDropProps) => {
    // Add sensors for drag and drop
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 10, // Minimum drag distance before activating
            },
        })
    );

    // Handle drag end
    const handleDragEnd = (event: DragEndEvent) => {
        const {active, over} = event;
        
        if (!over) return;
        
        if (active.id !== over.id) {
            const fromIndex = parseInt(active.id.toString().split('-')[1]);
            const toIndex = parseInt(over.id.toString().split('-')[1]);
            
            // Use immutable createWithMove instead of mutating move
            const newTracker = positionTracker.createWithMove(fromIndex, toIndex);
            const { newCmds, newCBP } = newTracker.evaluateCommandAndBreakPoints();
            updateState(newCmds, newCBP);
        }
    };

    const handleDragStart = () => {
        // Add a class to the body during drag operations
        document.body.classList.add('dragging-active');
    };

    const handleDragCancel = () => {
        document.body.classList.remove('dragging-active');
    };

    // Map all items to include IDs for sortable context
    const itemIds = positionTracker.map((_, i) => `item-${i}`);

    return {
        sensors,
        handleDragEnd,
        handleDragStart,
        handleDragCancel,
        itemIds
    };
}; 