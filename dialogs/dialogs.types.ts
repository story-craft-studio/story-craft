import {DialogCardProps} from '../components/container/dialog-card';

export interface DialogComponentProps
	extends Omit<DialogCardProps, 'headerLabel'> {
	onChangeProps: (props: Record<string, any>) => void;
}

export interface Dialog {
	id?: DialogId,
	centerScreen?: boolean, //default: false
	isSubDialogOfId?: string, // each sub dialog should belong to one main dialog, use its id as reference here

	/**
	 * Component to render.
	 */
	component: React.ComponentType<any>;
	/**
	 * Is the dialog highlighted? This is used to call attention to one when the
	 * user asks to re-open it.
	 */
	highlighted: boolean;
	/**
	 * Props to apply to the component.
	 */
	props?: Record<string, any>;
}

export interface DialogsState {
	/**
	 * Currently visible dialogs
	 */
	activeDialogs: Dialog[];
	
	/**
	 * Stack of hidden dialogs
	 */
	dialogStack: Dialog[];
}

export type DialogsAction =
	| {
			type: 'addDialog';
			id?: DialogId,
			isSubDialogOfId?: string,
			component: React.ComponentType<any>;
	        centerScreen?: boolean, //default: false
			props?: Record<string, any>;
	  }
	| {type: 'removeDialog'; index: number}
	| {type: 'removeDialogById'; id: string}
	| {type: 'setDialogHighlighted'; highlighted: boolean; index: number}
	| {type: 'setDialogProps'; index: number; props: Record<string, any>};

export type ActionDialogId = 'CharacterSettings' | 'DialogSettings' | 'StartMenuSettings' | 'EndMenuSettings' | 'ChoiceMenuSettings';
export type DialogId = ActionDialogId | 'CharacterSettingsSubDialog'
