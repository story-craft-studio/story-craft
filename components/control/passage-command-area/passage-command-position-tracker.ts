import {PassageCommand} from "../../../common/passage-command/PassageCommandTypeDef";
import {BreakPoint, CommandBreakPoints} from "../../../../shared/typedef/command-break-points";

/**
 * Types of elements in the position tracker
 */
enum ElementType {
	COMMAND = 'cmd',
	BREAKPOINT = 'bp'
}

/**
 * An element in the position tracker - either a command or breakpoint
 */
type TrackerElement = {
	content: PassageCommand | BreakPoint;
	type: ElementType;
}

/**
 * Constructor arguments for creating a position tracker
 */
export type PassageCommandPositionTrackerConstructArgs = {
	commands: PassageCommand[];
	commandBreakPoint?: CommandBreakPoints;
}

/**
 * Simplified position tracker that manages the order of commands and breakpoints
 */
export default class PassageCommandPositionTracker {
	private elements: TrackerElement[] = [];

	get elementCount(): number {
		return this.elements.length;
	}

	get lastIndex(): number {
		return this.elements.length - 1;
	}

	private constructor(args?: PassageCommandPositionTrackerConstructArgs) {
		if (args) {
			this.buildFromCommandsAndBreakpoints(args.commands, args.commandBreakPoint);
		}
	}

	/**
	 * Create a new position tracker
	 */
	static create(args?: PassageCommandPositionTrackerConstructArgs): PassageCommandPositionTracker {
		return new PassageCommandPositionTracker(args);
	}

	/**
	 * Build the element list from commands and breakpoints
	 * Logic: For each command slot, add breakpoints first, then the command
	 * Finally add breakpoints at the final slot
	 */
	private buildFromCommandsAndBreakpoints(commands: PassageCommand[], commandBreakPoint?: CommandBreakPoints): void {
		this.elements = [];

		if (!commandBreakPoint) {
			// No breakpoints, just add commands
			commands.forEach(cmd => {
				this.elements.push({
					content: cmd,
					type: ElementType.COMMAND
				});
			});
			return;
		}

		// Add breakpoints and commands in order
		commands.forEach((cmd, index) => {
			// Add breakpoints for this slot first
			const breakpoints = commandBreakPoint.getBreakPoints(index);
			breakpoints.forEach(bp => {
				this.elements.push({
					content: bp,
					type: ElementType.BREAKPOINT
				});
			});

			// Add the command
			this.elements.push({
				content: cmd,
				type: ElementType.COMMAND
			});
		});

		// Add breakpoints at the final slot (after all commands)
		const finalBreakpoints = commandBreakPoint.getBreakPoints(commands.length);
		finalBreakpoints.forEach(bp => {
			this.elements.push({
				content: bp,
				type: ElementType.BREAKPOINT
			});
		});
	}

	/**
	 * Update the tracker with new commands and breakpoints
	 */
	updatePosTrackerFrom(commands: PassageCommand[], commandBreakPoint?: CommandBreakPoints): PassageCommandPositionTracker {
		this.buildFromCommandsAndBreakpoints(commands, commandBreakPoint);
		return this;
	}

	/**
	 * Extract commands and breakpoints from current element order
	 */
	evaluateCommandAndBreakPoints(): {newCmds: PassageCommand[], newCBP: CommandBreakPoints} {
		const newCmds: PassageCommand[] = [];
		const newCBP = new CommandBreakPoints();
		let currentSlot = 0;

		this.elements.forEach(element => {
			if (element.type === ElementType.COMMAND) {
				newCmds.push(element.content as PassageCommand);
				currentSlot = newCmds.length; // Move to next slot after command
			} else {
				// Add breakpoint to current slot
				newCBP.addToSlot(currentSlot, element.content as BreakPoint);
			}
		});

		return { newCmds, newCBP };
	}

	/**
	 * Get element at position
	 */
	getElementAt(posIndex: number): TrackerElement | undefined {
		if (posIndex < 0 || posIndex >= this.elements.length) {
			return undefined;
		}
		return this.elements[posIndex];
	}

	/**
	 * Check if element is a command
	 */
	isCmd(element: TrackerElement): boolean {
		return element.type === ElementType.COMMAND;
	}

	/**
	 * Check if element is a breakpoint
	 */
	isBreakPoint(element: TrackerElement): boolean {
		return element.type === ElementType.BREAKPOINT;
	}

	/**
	 * Get command index from position index
	 */
	evaluateCmdIndex(posIndex: number): {cmdIndex: number, cmd: PassageCommand | undefined} {
		const element = this.getElementAt(posIndex);
		
		if (!element || !this.isCmd(element)) {
			return {cmdIndex: -1, cmd: undefined};
		}

		// Count commands before this position
		let cmdIndex = 0;
		for (let i = 0; i < posIndex; i++) {
			if (this.isCmd(this.elements[i])) {
				cmdIndex++;
			}
		}

		return {
			cmdIndex,
			cmd: element.content as PassageCommand
		};
	}

	/**
	 * Get breakpoint slot and index from position index
	 */
	evaluateBreakPointSlot(posIndex: number): {slotIndex: number, bpIndex: number, bp: BreakPoint | undefined} {
		const element = this.getElementAt(posIndex);
		
		if (!element || !this.isBreakPoint(element)) {
			return {slotIndex: -1, bpIndex: -1, bp: undefined};
		}

		let slotIndex = 0;
		let bpIndexInSlot = 0;

		for (let i = 0; i < posIndex; i++) {
			const currentElement = this.elements[i];
			if (this.isCmd(currentElement)) {
				slotIndex++;
				bpIndexInSlot = 0;
			} else {
				if (i < posIndex) {
					bpIndexInSlot++;
				}
			}
		}

		return {
			slotIndex,
			bpIndex: bpIndexInSlot,
			bp: element.content as BreakPoint
		};
	}

	/**
	 * Create a deep clone
	 */
	clone(): PassageCommandPositionTracker {
		const cloned = new PassageCommandPositionTracker();
		cloned.elements = this.elements.map(element => ({
			content: element.content,
			type: element.type
		}));
		return cloned;
	}

	/**
	 * Create new tracker with elements swapped
	 */
	createWithSwap(indexA: number, indexB: number): PassageCommandPositionTracker {
		if (indexA < 0 || indexA >= this.elements.length || 
			indexB < 0 || indexB >= this.elements.length) {
			return this.clone();
		}

		const cloned = this.clone();
		const temp = cloned.elements[indexA];
		cloned.elements[indexA] = cloned.elements[indexB];
		cloned.elements[indexB] = temp;
		return cloned;
	}

	/**
	 * Create new tracker with element moved
	 */
	createWithMove(fromIndex: number, toIndex: number): PassageCommandPositionTracker {
		if (fromIndex === toIndex) return this.clone();
		
		if (fromIndex < 0 || fromIndex >= this.elements.length ||
			toIndex < 0 || toIndex >= this.elements.length) {
			return this.clone();
		}

		const cloned = this.clone();
		const element = cloned.elements[fromIndex];
		cloned.elements.splice(fromIndex, 1);
		cloned.elements.splice(toIndex, 0, element);
		return cloned;
	}

	/**
	 * Create new tracker with elements spliced
	 */
	createWithSplice(startIndex: number, deleteCount: number, ...items: TrackerElement[]): PassageCommandPositionTracker {
		if (startIndex < 0 || startIndex >= this.elements.length) {
			return this.clone();
		}

		const cloned = this.clone();
		cloned.elements.splice(startIndex, deleteCount, ...items);
		return cloned;
	}

	/**
	 * Map over elements
	 */
	map<T>(callback: (element: TrackerElement, index: number) => T): T[] {
		return this.elements.map(callback);
	}

	/**
	 * Check if all elements match condition
	 */
	every(callback: (element: TrackerElement, index: number) => boolean): boolean {
		return this.elements.every(callback);
	}

	/**
	 * Validate index bounds
	 */
	private isValidIndex(index: number): boolean {
		return index >= 0 && index < this.elements.length;
	}
}
