import * as React from 'react';
import isEqual from 'lodash/isEqual';
import {Dialog, DialogsAction, DialogsState} from '../dialogs.types';
import _ from "lodash";

function removedByIndex(state: Dialog[], action: { type: "removeDialog"; index: number }) {
	let listOfRemovedDialogIds: string[] = [];
	let stateAfterward = state.filter((dialog, index) => {
		let toKeep = index !== action.index;
		if (!toKeep && !_.isNil(dialog.id)) {
			listOfRemovedDialogIds.push(dialog.id);
		}
		return toKeep;
	});
	console.log("BEFORE: ", stateAfterward)
	stateAfterward = stateAfterward.filter(dialog => {
		return !dialog.isSubDialogOfId;
	});
	console.log("AFTER: ", stateAfterward)
	return stateAfterward;
}

function removedById(state: Dialog[], action: { type: "removeDialogById", id: string }) {
	let listOfRemovedDialogIds: string[] = [];
	let stateAfterward = state.filter((dialog, index) => {
		let toKeep = dialog.id !== action.id;
		if (!toKeep && !_.isNil(dialog.id)) {
			listOfRemovedDialogIds.push(dialog.id);
		}
		return toKeep;
	});

	console.log("BEFORE: ", stateAfterward)
	stateAfterward = stateAfterward.filter(dialog => {
		return !dialog.isSubDialogOfId;
	});
	console.log("AFTER: ", stateAfterward)
	return stateAfterward;
}

export const reducer: React.Reducer<DialogsState, DialogsAction> = (
	state,
	action
) => {
	switch (action.type) {
		case 'addDialog': {
			const newDialog = {
				id: action.id,
				isSubDialogOfId: action.isSubDialogOfId,
				centerScreen: action.centerScreen,
				component: action.component,
				highlighted: false,
				props: action.props
			};

			// If this is a subdialog and its parent exists, keep the parent dialog
			if (action.isSubDialogOfId) {
				const parentDialog = state.activeDialogs.find(dialog => dialog.id === action.isSubDialogOfId);
				if (parentDialog) {
					return {
						...state,
						activeDialogs: [...state.activeDialogs, newDialog]
					};
				}
			}

			// Check if this dialog is in the stack (by ID)
			if (newDialog.id) {
				const stackIndex = state.dialogStack.findIndex(dialog => dialog.id === newDialog.id);
				
				if (stackIndex !== -1) {
					// If the dialog is in the stack, remove it from the stack and make it active
					const updatedStack = [...state.dialogStack];
					updatedStack.splice(stackIndex, 1);
					
					return {
						activeDialogs: [newDialog],
						dialogStack: updatedStack
					};
				}
			}

			let dialogStack = state.activeDialogs.length > 0 
				? [...state.dialogStack, ...state.activeDialogs]
				: state.dialogStack;
			dialogStack = dialogStack.filter(dialog => {
				return !dialog.isSubDialogOfId;
			});

			// Otherwise, push current dialogs to stack and replace with the new one
			return {
				activeDialogs: [newDialog],
				dialogStack: dialogStack
			};
		}

		case 'removeDialog': {
			const newActiveDialogs = removedByIndex(state.activeDialogs, action);
			
			// If we removed a dialog and no dialogs remain, get one from the stack
			if (state.activeDialogs.length > 0 && newActiveDialogs.length === 0 && state.dialogStack.length > 0) {
				const updatedStack = [...state.dialogStack];
				const topDialog = updatedStack.pop();
				
				return {
					activeDialogs: topDialog ? [topDialog] : [],
					dialogStack: updatedStack
				};
			}
			
			return {
				...state,
				activeDialogs: newActiveDialogs
			};
		}
		
		case 'removeDialogById': {
			const newActiveDialogs = removedById(state.activeDialogs, action);
			
			// If we removed a dialog and no dialogs remain, get one from the stack
			if (state.activeDialogs.length > 0 && newActiveDialogs.length === 0 && state.dialogStack.length > 0) {
				const updatedStack = [...state.dialogStack];
				const topDialog = updatedStack.pop();
				
				return {
					activeDialogs: topDialog ? [topDialog] : [],
					dialogStack: updatedStack
				};
			}
			
			return {
				...state,
				activeDialogs: newActiveDialogs
			};
		}

		case 'setDialogHighlighted':
			return {
				...state,
				activeDialogs: state.activeDialogs.map((dialog, index) =>
					index === action.index
						? {...dialog, highlighted: action.highlighted}
						: dialog
				)
			};

		case 'setDialogProps':
			return {
				...state,
				activeDialogs: state.activeDialogs.map((dialog, index) => ({
					...dialog,
					props: index === action.index ? action.props : dialog.props
				}))
			};
	}
};
