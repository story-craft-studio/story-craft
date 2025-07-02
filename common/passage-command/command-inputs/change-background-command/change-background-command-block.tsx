import * as React from "react";
import {useEffect, useState} from "react";
import {CommandListItemContext} from "../../../../components/control/passage-command-area/CommandListItemContext";
import {CommandBlockBody, CommandBlockHolder} from "../../command-blocks/base-ui";
import CommandNavigators from "../../../../components/control/passage-command-area/CommandNavigators";
import {useComponentTranslation} from "../../../../util/translation-wrapper";
import {FlexBox} from "../../../template/mui-template/flex-box";
import './change-background-command-block.css';
import EvtMgr, {EventName} from "../../../evt-mgr";
import ImageUrlInput, { uploadImage } from "../../command-blocks/image-url-input";
import { Modal } from "@mui/material";
import { styled } from "@mui/material/styles";

const VisuallyHiddenInput = styled('input')({
	clip: 'rect(0 0 0 0)',
	clipPath: 'inset(50%)',
	height: 1,
	overflow: 'hidden',
	position: 'absolute',
	bottom: 0,
	left: 0,
	whiteSpace: 'nowrap',
	width: 1,
});

export default function ChangeBackgroundCommandBlock() {
	const {t} = useComponentTranslation('changeBackgroundCommandBlock');

	const context = React.useContext(CommandListItemContext);

	const [tempText, setTempText] = useState(context?.commandText);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadPercent, setUploadPercent] = useState(0);
	const [openUploadingModal, setOpenUploadingModal] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	useEffect(() => {
		setTempText(context?.commandText);
	}, [context?.commandText]);

	const _onChangeText = (text) => {
		setTempText(text);
		context?._onChangeText(text);
	}

	return (
		<CommandBlockHolder className={'ChangeBackgroundCommandBlock'} style={{height: '100%'}} commandType={context?.command?.type}>
			<CommandNavigators/>
			<CommandBlockBody className={'ChangeBackgroundCommandBlockContent'}>
				<FlexBox>
					<ImageUrlInput
						title={t("imageUrl")}
						value={tempText}
						onChange={v => _onChangeText(v)}
						placeholder={t('enterImageURL')}
					/>
					<Modal
						open={openUploadingModal}
						onClose={() => {}}
					>
						<FlexBox sx={{
							position: 'absolute',
							top: '50%',
							left: '50%',
							transform: 'translate(-50%, -50%)',
							width: 400,
							bgcolor: 'background.paper',
							border: '2px solid #000',
							boxShadow: 24,
							p: 4,
						}}>
							<div>{uploadPercent}%</div>
							<div style={{ marginLeft: '15px' }}>Uploading...</div>
						</FlexBox>
					</Modal>
				</FlexBox>
			</CommandBlockBody>
		</CommandBlockHolder>
	)
}


