import {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {CommandType, PassageCommand} from "../../../../common/passage-command/PassageCommandTypeDef";
import {Passage, updatePassage} from "../../../../store/stories";
import {CommandBreakPoints} from "../../../../../shared/typedef/command-break-points";
import {PassageEditContext} from "../../../../dialogs/context/passage-edit-context";
import StringUtil from "../../../../util/StringUtil";
import _ from "lodash";

import PassageCommandPositionTracker from '../passage-command-position-tracker';
import {useErrorMessageTranslation} from "../../../../util/translation-wrapper";

type CommandState = {
    commands: PassageCommand[];
    commandBreakPoint: CommandBreakPoints;
};

/**
 * Simplified command manager for handling commands and breakpoints
 */
export const useCommandManager = (passage: Passage, initialCommands: PassageCommand[]) => {
    const {story, dispatch} = useContext(PassageEditContext);
    const {tError} = useErrorMessageTranslation();
    
    // Core state - grouped into single object
    const [commandState, setCommandState] = useState<CommandState>(() => ({
        commands: initialCommands?.filter(Boolean) || [],
        commandBreakPoint: CommandBreakPoints.fromRaw(passage.commandBreakPoint)
    }));

    const commandStateRef = useRef<CommandState>(commandState);
    useEffect(() => {
        commandStateRef.current = commandState;
    }, [commandState]);

    const [positionTracker, setPositionTracker] = useState(() =>
        PassageCommandPositionTracker.create({
            commands: commandState.commands, 
            commandBreakPoint: commandState.commandBreakPoint
        })
    );

    // Error state for breakpoints
    const [commandBreakPointErr, setCommandBreakPointErr] = useState(new Map());

    /**
     * Update state with new commands and breakpoints
     */
    const updateState = useCallback((
        newCommands: PassageCommand[], 
        newBreakPoint: CommandBreakPoints,
        shouldSave = true
    ) => {
        const newState: CommandState = {
            commands: newCommands,
            commandBreakPoint: newBreakPoint
        };
        setCommandState(newState);
        
        const newTracker = PassageCommandPositionTracker.create({
            commands: newCommands,
            commandBreakPoint: newBreakPoint
        });
        setPositionTracker(newTracker);

        if (shouldSave) {
            dispatch(updatePassage(story, passage, {
                commands: newCommands,
                commandBreakPoint: newBreakPoint
            }));
        }
    }, [dispatch, story, passage]);

    // Debounced functions for performance
    const debouncedUpdatePassage = useCallback(
        _.debounce((updatedCommands: PassageCommand[], updatedBreakPoint?: CommandBreakPoints) => {
            updateState(updatedCommands, updatedBreakPoint || commandStateRef.current.commandBreakPoint);
        }, 500),
        [updateState]
    );

    const debouncedUpdateBreakPointName = useCallback(
        _.debounce((updatedBreakPoint: CommandBreakPoints) => {
            updateState(commandStateRef.current.commands, updatedBreakPoint);
        }, 1000),
        [updateState]
    );

    // Cleanup debounced functions
    useEffect(() => {
        return () => {
            debouncedUpdatePassage.cancel();
            debouncedUpdateBreakPointName.cancel();
        };
    }, [debouncedUpdatePassage, debouncedUpdateBreakPointName]);

    const addBreakPoint = useCallback((
        commands: PassageCommand[],
        posIndex: number,
        baseName: string = 'MyDefaultTag') => {
        // Input validation
        if (posIndex < 0 || posIndex > commands.length) {
            console.error('Invalid posIndex for addBreakPoint:', posIndex);
            return;
        }

        const newBreakPoint = commandStateRef.current.commandBreakPoint.clone();
        const existingNames = newBreakPoint.getUniqueNames();
        
        // Generate unique name using proper logic
        let newBreakPointName = baseName;
        let counter = 1;
        
        while (existingNames.has(newBreakPointName)) {
            counter++;
            newBreakPointName = `${baseName}(${counter})`;
        }

        newBreakPoint.addToSlot(posIndex, {
            name: newBreakPointName,
        });

        // Use updateState instead of calling both setCommandBreakPoint and updateState
        // updateState already handles setCommandBreakPoint internally
        updateState(commands, newBreakPoint);
        
        return newBreakPointName;
    }, [updateState]);

    /**
     * Sync state from position tracker
     */
    const syncFromTracker = useCallback((tracker: PassageCommandPositionTracker, shouldSave = true) => {
        const {newCmds, newCBP} = tracker.evaluateCommandAndBreakPoints();
        updateState(newCmds, newCBP, shouldSave);
    }, [updateState]);

    // Command operations
    const addCommand = useCallback((commandType: CommandType = CommandType.newCommand) => {
        const newCommand: PassageCommand = {
            id: StringUtil.randomString(),
            type: commandType,
            content: {},
        };

        const currentCommands = commandStateRef.current.commands;
        const updatedCommands = [...currentCommands, newCommand];
        
        // Special handling for tag command
        if (commandType === CommandType.tag) {
            addBreakPoint(updatedCommands, updatedCommands.length - 1);
        } else {
            updateState(updatedCommands, commandStateRef.current.commandBreakPoint);
        }
    }, [updateState, addBreakPoint]);

    const addCommandAt = useCallback((index: number) => {
        if (index < 0 || index > commandState.commands.length) {
            console.error('Invalid index for addCommandAt:', index);
            return;
        }

        const newCommand: PassageCommand = {
            id: StringUtil.randomString(),
            type: CommandType.newCommand,
            content: {},
        };

        const currentCommands = commandStateRef.current.commands;
        const updatedCommands = [
            ...currentCommands.slice(0, index),
            newCommand,
            ...currentCommands.slice(index)
        ];

        const updatedBreakPoint = commandStateRef.current.commandBreakPoint.clone();
        updatedBreakPoint.shiftSlotsDown(index + 1);

        updateState(updatedCommands, updatedBreakPoint);
    }, [updateState, commandState.commands.length]);

    const cloneCommand = useCallback((index: number) => {
        if (index < 0 || index >= commandState.commands.length) {
            console.error('Invalid index for cloneCommand:', index);
            return;
        }

        const currentCommands = commandStateRef.current.commands;
        const originalCommand = currentCommands[index];
        const clonedCommand = {
            ...JSON.parse(JSON.stringify(originalCommand)),
            id: StringUtil.randomString()
        };

        const updatedCommands = [
            ...currentCommands.slice(0, index + 1),
            clonedCommand,
            ...currentCommands.slice(index + 1)
        ];

        const updatedBreakPoint = commandStateRef.current.commandBreakPoint.clone();
        updatedBreakPoint.shiftSlotsDown(index + 2);

        updateState(updatedCommands, updatedBreakPoint);
    }, [updateState, commandState.commands.length]);

    const deleteCommand = useCallback((index: number) => {
        if (index < 0 || index >= commandState.commands.length) {
            console.error('Invalid index for deleteCommand:', index);
            return;
        }

        const currentCommands = commandStateRef.current.commands;
        const updatedCommands = [
            ...currentCommands.slice(0, index),
            ...currentCommands.slice(index + 1)
        ];

        const updatedBreakPoint = commandStateRef.current.commandBreakPoint.clone();
        // Remove breakpoints at the deleted command's slot and shift up
        const breakpointsAtSlot = updatedBreakPoint.getBreakPoints(index);
        breakpointsAtSlot.forEach(() => {
            updatedBreakPoint.deleteBreakPoint(index, 0); // Always delete first since array shrinks
        });
        updatedBreakPoint.shiftSlotsUp(index + 1);

        updateState(updatedCommands, updatedBreakPoint);
    }, [updateState, commandState.commands.length]);

    const updateCommandText = useCallback((text: string, posIndex: number) => {
        const element = positionTracker.getElementAt(posIndex);
        if (!element || !positionTracker.isCmd(element)) {
            console.error('Element at position', posIndex, 'is not a command');
            return;
        }

        const {cmdIndex} = positionTracker.evaluateCmdIndex(posIndex);
        if (cmdIndex < 0 || cmdIndex >= commandState.commands.length) {
            console.error('Invalid command index:', cmdIndex);
            return;
        }

        const currentCommands = commandStateRef.current.commands;
        const updatedCommands = [...currentCommands];
        updatedCommands[cmdIndex] = {
            ...updatedCommands[cmdIndex],
            content: {
                ...updatedCommands[cmdIndex].content,
                text
            }
        };

        setCommandState(prev => ({ ...prev, commands: updatedCommands }));
        debouncedUpdatePassage(updatedCommands);
    }, [positionTracker, debouncedUpdatePassage, commandState.commands.length]);

    const updateCommandType = useCallback((index: number, commandType: CommandType) => {
        if (index < 0 || index >= commandState.commands.length) {
            console.error('Invalid index for updateCommandType:', index);
            return;
        }

        const currentCommands = commandStateRef.current.commands;
        let updatedCommands = [...currentCommands];
        updatedCommands[index] = {
            ...updatedCommands[index],
            type: commandType,
            content: {
                ...updatedCommands[index].content,
                text: updatedCommands[index].content?.text || ''
            }
        };

        // Special handling for tag command - move it down
        if (commandType === CommandType.tag) {
            addBreakPoint(updatedCommands, index);
        } else {
            updateState(updatedCommands, commandStateRef.current.commandBreakPoint);
        }
    }, [updateState, addBreakPoint, commandState.commands.length]);

    const updateWholeCommand = useCallback((index: number, newCommand: PassageCommand) => {
        if (index < 0 || index >= commandState.commands.length) {
            console.error('Invalid index for updateWholeCommand:', index);
            return;
        }

        const currentCommands = commandStateRef.current.commands;
        const updatedCommands = [...currentCommands];
        updatedCommands[index] = newCommand;
        updateState(updatedCommands, commandStateRef.current.commandBreakPoint);
    }, [updateState, commandState.commands.length]);

    // Movement operations
    const swapElements = useCallback((indexA: number, indexB: number) => {
        if (indexA < 0 || indexA >= positionTracker.elementCount ||
            indexB < 0 || indexB >= positionTracker.elementCount) {
            console.error('Invalid indices for swap:', indexA, indexB);
            return;
        }

        const newTracker = positionTracker.createWithSwap(indexA, indexB);
        syncFromTracker(newTracker);
    }, [positionTracker, syncFromTracker]);

    const moveElementUp = useCallback((posIndex: number) => {
        if (posIndex <= 0) {
            // Move to end
            swapElements(posIndex, positionTracker.elementCount - 1);
        } else {
            swapElements(posIndex, posIndex - 1);
        }
    }, [positionTracker.elementCount, swapElements]);

    const moveElementDown = useCallback((posIndex: number) => {
        if (posIndex >= positionTracker.elementCount - 1) {
            // Move to beginning
            swapElements(posIndex, 0);
        } else {
            swapElements(posIndex, posIndex + 1);
        }
    }, [positionTracker.elementCount, swapElements]);

    // Breakpoint operations
    const updateBreakPointText = useCallback((event: any, posIndex: number) => {
        const {slotIndex, bpIndex} = positionTracker.evaluateBreakPointSlot(posIndex);
        if (slotIndex < 0) {
            console.error('No breakpoint at position:', posIndex);
            return;
        }

        const newName = event.target.value;
        const newBreakPoint = commandStateRef.current.commandBreakPoint.clone();
        newBreakPoint.setBreakPointName(slotIndex, bpIndex, newName);

        setCommandState(prev => ({ ...prev, commandBreakPoint: newBreakPoint }));
        debouncedUpdateBreakPointName(newBreakPoint);
    }, [positionTracker, debouncedUpdateBreakPointName]);

    const removeBreakPoint = useCallback((posIndex: number) => {
        const {slotIndex, bpIndex} = positionTracker.evaluateBreakPointSlot(posIndex);
        if (slotIndex < 0) {
            console.error('No breakpoint at position:', posIndex);
            return;
        }

        const newBreakPoint = commandStateRef.current.commandBreakPoint.clone();
        newBreakPoint.deleteBreakPoint(slotIndex, bpIndex);
        
        const newTracker = PassageCommandPositionTracker.create({
            commands: commandState.commands,
            commandBreakPoint: newBreakPoint
        });
        
        syncFromTracker(newTracker);
    }, [positionTracker, commandState.commands, syncFromTracker]);

    // Validation for breakpoint names
    useEffect(() => {
        const errors = new Map();
        const nameCount = new Map<string, number>();

        commandStateRef.current.commandBreakPoint.forEachBreakPoint((bp) => {
            const trimmedName = bp.name.trim();
            const count = commandStateRef.current.commandBreakPoint.getNameUsageCount(trimmedName);
            if (count > 1) {
                errors.set(bp, { message: 'duplicatedBreakPointName' });
            }
        });

        setCommandBreakPointErr(errors);
    }, [commandState.commandBreakPoint]);

    // Handle external changes to passage (prevent race condition)
    useEffect(() => {
        // Only update if the raw data actually changed from external source
        const currentRaw = JSON.stringify(commandState.commandBreakPoint);
        const newBreakPoint = CommandBreakPoints.fromRaw(passage.commandBreakPoint);
        const newRaw = JSON.stringify(newBreakPoint);
        
        if (currentRaw !== newRaw) {
            console.log('External passage.commandBreakPoint changed, updating local state');
            const newTracker = PassageCommandPositionTracker.create({
                commands: commandState.commands,
                commandBreakPoint: newBreakPoint
            });
            
            setCommandState(prev => ({ ...prev, commandBreakPoint: newBreakPoint }));
            setPositionTracker(newTracker);
        }
    }, [passage.commandBreakPoint, commandState.commandBreakPoint, commandState.commands]);

    // Cleanup excessive breakpoint slots
    useEffect(() => {
        const hasChanged = commandStateRef.current.commandBreakPoint.cleanupExcessiveSlots(commandState.commands.length);
        if (hasChanged) {
            setCommandState(prev => ({ 
                ...prev, 
                commandBreakPoint: commandStateRef.current.commandBreakPoint.clone() 
            }));
        }
    }, [commandState.commands.length, commandState.commandBreakPoint]);

    return {
        // State
        commands: commandState.commands,
        commandBreakPoint: commandState.commandBreakPoint,
        positionTracker,
        commandBreakPointErr,
        
        updateState,
        
        // Command operations
        addCommand,
        addCommandAt,
        cloneCommand,
        deleteCommand,
        updateCommandText,
        updateCommandType,
        updateWholeCommand,
        
        // Movement operations
        swapElements,
        moveElementUp,
        moveElementDown,
        
        // Breakpoint operations
        addBreakPoint,
        updateBreakPointText,
        removeBreakPoint,
        
        // Utilities
        tError
    };
}; 