import { Box, Modal } from "@mui/material";
import React from "react";
import PreviewImageDialog from "../../../../dialogs/preview-image-dialog/preview-image-dialog";



const previewModalStyle = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	boxShadow: 24,
};

export class PreviewImageModal extends React.Component<{
	open: boolean,
	onClose: () => void,
	url: string | undefined,
}> {
	render() {
		return <Modal
			open={this.props.open}
			onClose={this.props.onClose}
			aria-labelledby="modal-modal-title"
			aria-describedby="modal-modal-description"
		>
			<Box sx={previewModalStyle}>
				<PreviewImageDialog imgUrl={this.props.url}/>
			</Box>
		</Modal>;
	}
}