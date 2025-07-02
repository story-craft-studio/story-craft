import React, { useState, useRef, useEffect } from 'react';
import { Typography, Button, Box, Modal, Tooltip } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LinkIcon from '@mui/icons-material/Link';
import StoreIcon from '@mui/icons-material/Store';
import styled from 'styled-components';
import { TextField } from '@mui/material';
import { theme } from './base-ui';
import EvtMgr, { EventName } from '../../evt-mgr';
import { styled as muiStyled } from "@mui/material/styles";
import AssetMgr from '../../asset/asset-mgr';
import { AssetType } from '../../../_genApi/static-asset';
import StringUtil from '../../../util/StringUtil';
import { UploadAssetDesc } from '../../asset/asset-typedef';
import { CircularProgressWithLabel } from "../../template/mui-template/progress";
import { FlexBox, AutoVerticalAlignTypography } from "../../template/mui-template/flex-box";
import AssetStoreModal from '../../asset/asset-store-modal/asset-store-modal';
import { AssetStoreModalPropsCloseArgs } from '../../asset/asset-store-modal/asset-store-type-def';

// Visually hidden input for file uploads
const VisuallyHiddenInput = muiStyled('input')({
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

const uploadingModalStyle = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 400,
	bgcolor: 'background.paper',
	border: '2px solid #000',
	boxShadow: 24,
	p: 4,
};

/**
 * General function to upload images
 * 
 * @param {File[]} files - Array of files to upload
 * @param {Function} onSuccess - Callback when upload is successful, receives array of uploaded file URLs
 * @param {Function} onError - Callback when upload fails, receives error object
 * @param {Function} onProgress - Optional callback for upload progress updates
 * @returns {Object} - Object with methods to control the upload process
 */
export const uploadImage = (files: File[], onSuccess?: (urls: string[]) => void, onError?: (error: any) => void, onProgress?: (percent: number) => void) => {
	if (!files?.length) {
		if (onError) onError(new Error('No files selected'));
		return;
	}

	let fileDescs: UploadAssetDesc[] = [];
	for (let i = 0; i < files.length; i++) {
		let file = files[i];
		if (!file) continue;

		fileDescs.push({
			assetType: AssetType.IMAGE,
			name: file.name,
			fileExtension: StringUtil.getFilePathExtension(file.name),
			file
		});
	}

	let doneCount = 0;
	AssetMgr.uploadMultipleAsset(fileDescs, {
		progressCb: (doneIdx: number) => {
			doneCount++;
			if (onProgress) onProgress(doneCount / fileDescs.length * 100);
		}
	}).then(result => {
		if (!result.successRes?.length) {
			let firstErr = result.errRes?.[0];
			if (firstErr) {
				throw firstErr;
			}
			throw new Error('unknown');
		}

		const uploadedUrls: string[] = [];
		result.successRes.forEach((uploadResult) => {
			if (uploadResult?.relativeLink) {
				uploadedUrls.push(AssetMgr.toRealUrl(uploadResult.relativeLink));
			}
		});

		if (onSuccess) onSuccess(uploadedUrls);
	}).catch(err => {
		if (onProgress) onProgress(0);
		if (onError) onError({
			message: err?.message || 'unknown'
		});
	});
};

// Main container for the image URL input component
const ImageUrlContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
  padding-top: 7px;
`;

// Label styling
const InputLabel = styled(Typography)`
  font-size: 0.875rem;
  color: ${theme.buttonText};
  position: absolute;
  top: 0;
  left: 10px;
  z-index: 1;
  background-color: white;
  padding: 0 5px;
`;

// Container for the input area with buttons
const ButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  height: 47px;
  background-color: ${theme.titleBackground};
  border-radius: 10px;
  padding: 5px;
  margin-top: 7px;
  border: 1px solid #e0e0e0;
`;

// Button styling for the upload options
const OptionButton = styled(Button)`
  background-color: #c9f4ff;
  color: ${theme.buttonText};
  border-radius: 5px;
  text-transform: none;
  margin: 0 5px;
  height: 30px;
  
  &:hover {
    background-color: #a8e6ff;
  }
`;

// Preview image container
const ImagePreview = styled.div`
  width: 38px;
  height: 35px;
  border: 1px solid black;
  border-radius: 5px;
  margin-left: auto;
  background-size: cover;
  background-position: center;
  overflow: hidden;
`;

/**
 * ImageUrlInput component
 * A component that allows selecting image URLs through multiple methods:
 * - Upload
 * - Paste URL
 * - Asset Store
 * 
 * @param props.title - Label for the input
 * @param props.value - Current value of the image URL
 * @param props.onChange - Callback when value changes
 * @param props.placeholder - Placeholder for the URL
 * @param props.onPasteUrl - Callback for paste URL button click
 * @param props.onAssetStore - Callback for asset store button click
 * @returns React component
 */
const ImageUrlInput = (props: {
	title: string;
	value?: string;
	onChange?: (value: string) => void;
	placeholder?: string;
	onPasteUrl?: () => void;
	onAssetStore?: () => void;
	className?: string;
}) => {
	const [showUrlInput, setShowUrlInput] = useState(false);
	const [tempUrl, setTempUrl] = useState(props.value || '');
	const [uploadPercent, setUploadPercent] = useState(0);
	const [openUploadingModal, setOpenUploadingModal] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [openMyAssets, setOpenMyAssets] = useState(false);

	const handlePasteUrl = () => {
		if (props.onPasteUrl) {
			props.onPasteUrl();
		} else {
			setShowUrlInput(true);
		}
	};

	const handleUrlSubmit = () => {
		if (props.onChange) {
			props.onChange(tempUrl);
		}
		setShowUrlInput(false);
	};

	const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		// Handle file upload directly
		const files = event.target.files;
		if (!files?.length) return;

		setErrorMessage('');
		setOpenUploadingModal(true);
		setUploadPercent(0);

		uploadImage(
			Array.from(files),
			(uploadedUrls) => {
				setOpenUploadingModal(false);
				if (uploadedUrls.length > 0 && props.onChange) {
					props.onChange(uploadedUrls[0]);
					setTempUrl(uploadedUrls[0]);
				}
			},
			(error) => {
				setOpenUploadingModal(false);
				setErrorMessage(error.message || 'Upload failed');
			},
			(progress) => {
				setUploadPercent(progress);
			}
		);
	};

	const handleAssetStore = (ev: React.MouseEvent) => {
		setOpenMyAssets(true);
		if (props.onAssetStore) {
			props.onAssetStore();
		}
	};

	const onCloseAssetStoreModal = (args: AssetStoreModalPropsCloseArgs | undefined) => {
		setOpenMyAssets(false);
		let chooseMyAssetItem = args?.chooseMyAssetItem;
		if (!chooseMyAssetItem) {
			return;
		}
		if (props.onChange) {
			props.onChange(AssetMgr.toRealUrl(chooseMyAssetItem.relativeLink));
		}
	};

	return (
		<ImageUrlContainer className={props.className}>
			<InputLabel>{props.title}</InputLabel>

			{showUrlInput ? (
				<Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
					<TextField
						fullWidth
						placeholder={props.placeholder || "Enter image URL"}
						value={tempUrl}
						onChange={(e) => setTempUrl(e.target.value)}
						sx={{
							backgroundColor: "white",
							borderRadius: "8px",
							"& .MuiOutlinedInput-root": {
								borderRadius: "8px",
								minHeight: "40px",
								"& fieldset": {
									border: "none"
								},
							},
						}}
					/>
					<Button
						variant="contained"
						onClick={handleUrlSubmit}
						sx={{ ml: 1, height: '40px' }}
					>
						OK
					</Button>
				</Box>
			) : (
				<ButtonsContainer>
					<label style={{ display: 'inline-flex', cursor: 'pointer' }}>
						<OptionButton
							startIcon={<CloudUploadIcon />}
							component="span"
							sx={{ width: 'auto', display: 'inline-flex' }}
						>
							Upload
						</OptionButton>
						<VisuallyHiddenInput
							type="file"
							onChange={handleUpload}
							accept="image/*"
							multiple
						/>
					</label>

					<OptionButton
						startIcon={<LinkIcon />}
						onClick={handlePasteUrl}
					>
						Paste URL
					</OptionButton>

					<OptionButton
						startIcon={<StoreIcon />}
						onPointerDown={handleAssetStore}
					>
						Asset Store
					</OptionButton>

					{props.value && (
						<Tooltip
							title={
								<img
									src={props.value}
									alt="Preview"
									style={{ maxWidth: 240, maxHeight: 180, display: 'block' }}
								/>
							}
							placement="top"
							arrow
						>
							<ImagePreview
								style={{ backgroundImage: `url(${props.value})` }}
							/>
						</Tooltip>
					)}
				</ButtonsContainer>
			)}

			{/* Upload progress modal */}
			<Modal
				open={openUploadingModal}
				onClose={() => { }} // Prevent closing during upload
			>
				<FlexBox sx={uploadingModalStyle}>
					<CircularProgressWithLabel value={uploadPercent} />
					<AutoVerticalAlignTypography sx={{ ml: '15px' }}>Uploading...</AutoVerticalAlignTypography>
				</FlexBox>
			</Modal>

			{/* Asset Store Modal */}
			<AssetStoreModal
				open={openMyAssets}
				onClose={onCloseAssetStoreModal}
			/>

			{/* Error message */}
			{errorMessage && (
				<Typography color="error" sx={{ mt: 1 }}>
					{errorMessage}
				</Typography>
			)}
		</ImageUrlContainer>
	);
};

export default ImageUrlInput; 