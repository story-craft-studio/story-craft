import {Box} from "@mui/material";
import React, {useEffect, useState} from "react";
import EvtMgr, {EventName} from "../../../common/evt-mgr";
import {useDialogsContext} from "../../../dialogs";
import {Story, storyWithId, useStoriesContext} from "../../../store/stories";
import {useParams} from "react-router-dom";
import _ from "lodash";
import {DemoSettingsModal} from "./demo-settings-modal";


export function ModalsATopOfStoryEditor() {
	const {storyId} = useParams<{storyId: string}>();
	const {stories} = useStoriesContext();
	const [curStory, setCurStory] = useState<Story | undefined>(undefined);
	useEffect(() => {
		if (_.isNil(storyId)) {
			setCurStory(undefined);
			return;
		}
		let newStory = storyWithId(stories, storyId);
		setCurStory(newStory);
	}, [stories, storyId]);

	const {dialogs} = useDialogsContext();
	const getDialogCount = (): number => {
		return dialogs.activeDialogs?.length || 0;
	}
	const anyDialogOpening = (): boolean => {
		return getDialogCount() > 0;
	}

	const anyModalOpen = () => {
		return openDemoModal;
	}

	//#region settings demo modal
	//==========================
	const [openDemoModal, setOpenDemoModal] = React.useState<boolean>(false);
	const [useDemoCharacterIndex, setUseDemoCharacterIndex] = useState(NaN);
	const setEnableDemoModal = (args: any) => {
		const {needEnable} = args;
		console.log('enableDemoModal', args);
		setUseDemoCharacterIndex(args.characterIndex);
		setOpenDemoModal(!!needEnable);
	}
	useEffect(() => {
		EvtMgr.on(EventName.enableDemoModal, setEnableDemoModal);
		return () => {
			EvtMgr.off(EventName.enableDemoModal, setEnableDemoModal);
		}
	}, []);
	//#endregion

	return <>
		<Box sx={{
			display: anyModalOpen() ? 'fixed' : 'none',
			position: 'fixed',
			zIndex: 1300,
			right: 0,
			bottom: 0,
			top: 0,
			left: 0,
		}}>
			<Box aria-hidden="true"
			     className="MuiBackdrop-root MuiModal-backdrop css-4nmryk-MuiBackdrop-root-MuiModal-backdrop"
			     sx={{
				     position: 'fixed',
				     display: 'flex',
				     alignItems: 'center',
				     WebkitBoxPack: 'center',
				     msFlexPack: 'center',
				     justifyContent: 'center',
				     right: '0',
				     bottom: '0',
				     top: '0',
				     left: '0',
				     backgroundColor: 'rgba(0, 0, 0, 0.5)',
				     WebkitTapHighlightColor: 'transparent',
				     zIndex: -1,

				     opacity: 1,
				     transition: 'opacity 225ms cubic-bezier(0.4, 0, 0.2, 1)',
			     }}>
			</Box>

			<DemoSettingsModal
				openDemoModal={openDemoModal}
				anyDialogOpening={anyDialogOpening()}
				curStory={curStory}
				useDemoCharacterIndex={useDemoCharacterIndex}
			/>

			{/*Other modals goes here...*/}
		</Box>
	</>
;
}
