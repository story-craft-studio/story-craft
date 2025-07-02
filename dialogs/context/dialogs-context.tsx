import * as React from 'react';
import useThunkReducer from 'react-hook-thunk-reducer';
import {reducer} from './reducer';
import {Dialogs} from './dialogs';
import {DialogsAction, DialogsState} from '../dialogs.types';

export interface DialogsContextProps {
	dispatch: React.Dispatch<DialogsAction | React.Dispatch<DialogsAction>>;
	dialogs: DialogsState;
}

export const DialogsContext = React.createContext<DialogsContextProps>({
	dispatch: () => {},
	dialogs: {
		activeDialogs: [],
		dialogStack: []
	},
});

DialogsContext.displayName = 'Dialogs';

export const useDialogsContext = () => React.useContext(DialogsContext);

export const DialogsContextProvider: React.FC = props => {
	const [dialogs, dispatch] = useThunkReducer(reducer, {
		activeDialogs: [],
		dialogStack: []
	});

	return (
		<DialogsContext.Provider value={{dispatch, dialogs}}>
			{props.children}
			<Dialogs />
		</DialogsContext.Provider>
	);
};
