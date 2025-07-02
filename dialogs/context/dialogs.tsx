import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

import {useScrollbarSize} from 'react-scrollbar-size';
import {CSSTransition, TransitionGroup} from 'react-transition-group';
import {useDialogsContext} from '.';
import {PrefsState, usePrefsContext} from '../../store/prefs';
import './dialogs.css';
import {Dialog, DialogsAction, DialogsState} from "../dialogs.types";
import {Thunk} from "react-hook-thunk-reducer";
import {useEffect, useState} from "react";
import {SxProps, useMediaQuery} from "@mui/material";
import GlobalPointerEvent from "../../common/GlobalPointerEvent";
import _ from "lodash";

// TODO move this to separate module to avoid circular dep
const DialogTransition: React.FC = props => (
	<CSSTransition classNames="pop" timeout={200} {...props}>
		{props.children}
	</CSSTransition>
);

export const Dialogs: React.FC = () => {
	const {height, width} = useScrollbarSize();
	const {prefs} = usePrefsContext();
	const {dispatch, dialogs} = useDialogsContext();

	const containerStyle: React.CSSProperties = {
		paddingLeft: `calc(100% - (${prefs.dialogWidth}px + 2 * (var(--grid-size))))`,
		marginBottom: height,
		marginRight: width
	};

	// @ts-ignore
	const _onPointerMove: React.PointerEventHandler<HTMLDivElement> = (ev: PointerEvent) => {
		GlobalPointerEvent.onMoveTo(ev.clientX, ev.clientY);
	}


	const maxWidth1000 = useMediaQuery('(max-width:1000px)');
	const isSubDialog = (dialog: Dialog, index: number) => {
		if (_.isNil(dialog.isSubDialogOfId)) return false;

		//if screen is too narrow, group up these sub dialogs into the  'centerScreen' one
		if (maxWidth1000) return false;

		if (dialog.centerScreen) return false;
		return true;
	}

	const isCenterScreenDialog = (dialog: Dialog, index: number) => {
		if (dialog.centerScreen) return true;

		//if screen is too narrow, consider sub dialogs as  'centerScreen' one
		if (maxWidth1000 && !_.isNil(dialog.isSubDialogOfId)) return true;

		return false;
	}

	const isMainDialog = (dialog: Dialog, index: number) => {
		return !isSubDialog(dialog, index)
			&& !isCenterScreenDialog(dialog, index);
	}
	return (
		<div className="dialogs" style={containerStyle} onPointerMove={_onPointerMove}>
			<TransitionGroup
				component={null}
			>
				{/*sub dialogs*/}
				{dialogs.activeDialogs.map((dialog, index) => {
					if (!isSubDialog(dialog, index)) return null;

					const managementProps = {
						highlighted: dialog.highlighted,
						onChangeHighlighted: (highlighted: boolean) =>
							dispatch({type: 'setDialogHighlighted', highlighted, index}),
						onChangeProps: (props: Record<string, any>) =>
							dispatch({type: 'setDialogProps', index, props}),
						onClose: () => dispatch({type: 'removeDialog', index})
					};

					return (
						<CSSTransition
							classNames="pop"
							timeout={200}
							key={index}
							style={{
								position: 'absolute',
								width: `${prefs.subDialogWidth}px`,
								left: `calc(100% - (${prefs.dialogWidth}px + ${prefs.subDialogWidth}px + 2 * (var(--grid-size))))`,
							}}
						>
							<div className={'each-sub-dialog sub-dialog-of-' + dialog.isSubDialogOfId}>
								<dialog.component {...dialog.props} {...managementProps} />
							</div>
						</CSSTransition>
					);
				})}
		</TransitionGroup>
		<TransitionGroup component={null}>
				{/*main dialogs*/}
				{dialogs.activeDialogs.map((dialog, index) => {
					if (!isMainDialog(dialog, index)) return null;

					const managementProps = {
						highlighted: dialog.highlighted,
						onChangeHighlighted: (highlighted: boolean) =>
							dispatch({type: 'setDialogHighlighted', highlighted, index}),
						onChangeProps: (props: Record<string, any>) =>
							dispatch({type: 'setDialogProps', index, props}),
						onClose: () => dispatch({type: 'removeDialog', index})
					};

					return (
						<DialogTransition key={index}>
							<dialog.component {...dialog.props} {...managementProps} />
						</DialogTransition>
					);
				})}
			</TransitionGroup>

			<CenterScreenDialogs
				isCenterScreenDialog={isCenterScreenDialog}
				dialogs={dialogs}
				dispatch={dispatch}
				prefs={prefs}
			/>
		</div>
	);
};


const CenterScreenDialogBGStyle: SxProps = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 'auto',
	minWidth: '400px',
	boxShadow: 24,
};

export function CenterScreenDialogs(props: {
	isCenterScreenDialog: (dialog: Dialog, index: number) => boolean,
	dialogs: DialogsState,
	dispatch: React.Dispatch<DialogsAction | React.Dispatch<DialogsAction>>,
	prefs: PrefsState
}) {
	const {dialogs, dispatch, prefs} = props;

	const [anyDialogOpen, setAnyDialogOpen] = useState(false);
	useEffect(() => {
		setAnyDialogOpen(
			dialogs.activeDialogs.some(someDialog => someDialog.centerScreen)
		);
	}, [dialogs]);

	const handleClose = (event?: React.MouseEvent) => {
		// Prevent accidental closure if this is a propagated event from the content
		if (event && event.currentTarget !== event.target) {
			return;
		}
		
		//close the most recent center screen dialog
		if (dialogs.activeDialogs.length > 0) {
			for (let i = dialogs.activeDialogs.length - 1; i >= 0; i--) {
				if (isCenterScreenDialog(dialogs.activeDialogs[i], i)) {
					dispatch({type: 'removeDialog', index: i});
					break;
				}
			}
		}
	}

	return (
		<Modal
			hideBackdrop={false}
			open={anyDialogOpen}
			onClose={handleClose}
			aria-labelledby="modal-modal-title"
			aria-describedby="modal-modal-description"
			slotProps={{
				backdrop: {
					style: {
						backgroundColor: 'rgba(0, 0, 0, 0.7)'
					},
					onClick: handleClose
				}
			}}
			disableAutoFocus
		>
			<Box 
				sx={CenterScreenDialogBGStyle} 
				onClick={(e) => e.stopPropagation()}
			>
				{dialogs.activeDialogs.map((dialog, index) => {
					if (!props.isCenterScreenDialog(dialog, index)) return null;

					const managementProps = {
						highlighted: dialog.highlighted,
						onChangeHighlighted: (highlighted: boolean) =>
							dispatch({type: 'setDialogHighlighted', highlighted, index}),
						onChangeProps: (props: Record<string, any>) =>
							dispatch({type: 'setDialogProps', index, props}),
						onClose: () => dispatch({type: 'removeDialog', index})
					};

					return (
						<DialogTransition key={index}>
							<dialog.component {...dialog.props} {...managementProps} />
						</DialogTransition>
					);
				})}
			</Box>
		</Modal>
	);
}
