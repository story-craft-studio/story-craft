import { Box, Button, Divider, IconButton, SxProps, TextField, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { DialogCard, DialogCardProps } from "../../../../../components/container/dialog-card";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CharacterMgr } from "./character-mgr";
import Alert from "@mui/material/Alert";
import './character-settings-sub-dialog.css';
import { useDialogTranslation, useErrorMessageTranslation } from "../../../../../util/translation-wrapper";
import { storyWithId, useStoriesContext } from "../../../../../store/stories";
import { CharacterSkin } from "./character-typedef";
import SearchIcon from "@mui/icons-material/Search";
import AssetStoreModal from "../../../../../common/asset/asset-store-modal/asset-store-modal";
import { AssetStoreModalPropsCloseArgs } from "../../../../../common/asset/asset-store-modal/asset-store-type-def";
import AssetMgr from "../../../../../common/asset/asset-mgr";
import _ from "lodash";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from '@mui/icons-material/Delete';
import {
	AutoVerticalAlignTypography,
	FlexBox,
	FlexCenterBox
} from "../../../../../common/template/mui-template/flex-box";
import { CharacterSkinSetting } from "./character-skin-settings";
import { AbsoluteFlexBox, RelativeBox } from "../../../../../common/template/mui-template/position-box";
import BlockIcon from "@mui/icons-material/Block";
import { FullWidthButton } from "../../../../../common/template/mui-template/mui-button";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from "@mui/material/styles";
import { AssetType } from "../../../../../_genApi/static-asset";
import StringUtil from "../../../../../util/StringUtil";
import { UploadAssetDesc } from "../../../../../common/asset/asset-typedef";
import Modal from "@mui/material/Modal";
import { CircularProgressWithLabel } from "../../../../../common/template/mui-template/progress";
import CommonUtils from "../../../../../util/CommonUtils";
import EvtMgr, { EventName } from "../../../../../common/evt-mgr";
import { uploadImage } from "../../../../../common/passage-command/command-blocks/image-url-input";
import ImageUrlInput from "../../../../../common/passage-command/command-blocks/image-url-input";

const errorImg = '/common/imgs/image-not-found.png';

type AssetStoreExtraArguments = { skinIndex: number };

export default function CharacterSettingsSubDialog(props: DialogCardProps & { storyId: string, characterIndex: number }) {
	const { characterIndex, storyId, ...other } = props;
	const { dispatch, stories } = useStoriesContext();
	const story = storyWithId(stories, storyId);

	const { t } = useTranslation();
	const { tError } = useErrorMessageTranslation();
	const { tDia } = useDialogTranslation('characterSettings');

	const character = CharacterMgr.getByIndex(characterIndex);

	const [charName, setCharName] = useState(character?.displayName || '');
	useEffect(() => {
		setCharName(character?.displayName || '');
	}, [characterIndex]); //Weird..

	const _onChangeCharName = (ev) => {
		setCharName(ev.target.value);
		CharacterMgr.editChar({
			stories,
			story,
			delayS: 0.5,
			dispatchStory: dispatch,
			characterIndex,
			displayName: ev.target.value,
		})
	}

	const [skins, setSkins] = useState<CharacterSkin[]>(character?.skins || []);
	useEffect(() => {
		setSkins(character?.skins || []);
	}, [characterIndex]); //Weird..
	const _onChangeSkinId = (newVal, i) => {
		skins[i].id = newVal;

		let newSkins = [...skins];
		setSkins(newSkins);
		CharacterMgr.editChar({
			stories,
			story,
			delayS: 1,
			dispatchStory: dispatch,
			characterIndex,
			skins: newSkins,
		})
	}

	const _changeSkinUrl = (newVal: string, sknIdx: number) => {
		let changeCharacterImgUrlToo = {}
		if (sknIdx === 0) {
			changeCharacterImgUrlToo = {
				imgUrl: newVal,
			}
		}

		skins[sknIdx].imgUrl = newVal;

		let newSkins = [...skins];
		setSkins(newSkins);
		CharacterMgr.editChar({
			stories,
			story,
			delayS: 1,
			dispatchStory: dispatch,
			characterIndex,
			skins: newSkins,
			...changeCharacterImgUrlToo,
		})
	}

	const onChangeSkinSetting = (newSettings, i) => {
		skins[i].settings = newSettings;

		let newSkins = [...skins];
		setSkins(newSkins);
		CharacterMgr.editChar({
			stories,
			story,
			delayS: 0.5,
			dispatchStory: dispatch,
			characterIndex,
			skins: newSkins,
		})
	}

	const [skinUrls, setSkinUrls] = useState<string[]>([]);
	useEffect(() => {
		setSkinUrls(skins.map(each => each.imgUrl));
	}, [skins]);

	const [openMyAssets, setOpenMyAssets] = useState(false);
	const honningOnSkinIndex = useRef<number>(NaN);

	function onClickOpenAssetStore(ev, skinIndex: number) {
		setOpenMyAssets(true);
		honningOnSkinIndex.current = skinIndex;
	}

	const onCloseAssetStoreModal = (args: AssetStoreModalPropsCloseArgs<AssetStoreExtraArguments> | undefined) => {
		setOpenMyAssets(false);

		let chooseMyAssetItem = args?.chooseMyAssetItem;
		if (!chooseMyAssetItem) {
			console.log("wont change skinUrl cuz missing chooseMyAssetItem onCloseAssetStoreModal's arguments ");
			return;
		}

		let skinIndex = honningOnSkinIndex.current
		if (_.isNil(skinIndex)) {
			console.log("wont change skinUrl cuz missing 'honningOnSkinIndex'", honningOnSkinIndex);
			return;
		}
		let realUrl = AssetMgr.toRealUrl(chooseMyAssetItem.relativeLink);
		console.log('ChangeSkinUrl', realUrl, 'skinIndex=', skinIndex);
		_changeSkinUrl(
			realUrl,
			skinIndex
		);
		honningOnSkinIndex.current = NaN;
	}

	const addEmptySkin = () => {
		skins.push({
			imgUrl: errorImg,
			id: 'skins-' + CharacterMgr.nextId(),
		})

		let newSkins = [...skins];
		setSkins(newSkins);
		CharacterMgr.editChar({
			stories,
			story,
			dispatchStory: dispatch,
			characterIndex,
			skins: newSkins,
		})
	}

	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
	const [skinToDelete, setSkinToDelete] = useState<number | null>(null);

	const handleDeleteClick = (skinIndex: number) => {
		setSkinToDelete(skinIndex);
		setDeleteConfirmOpen(true);
	};

	const handleDeleteConfirm = () => {
		if (skinToDelete !== null) {
			removeSkinIndex(skinToDelete);
			setDeleteConfirmOpen(false);
			setSkinToDelete(null);
		}
	};

	const handleDeleteCancel = () => {
		setDeleteConfirmOpen(false);
		setSkinToDelete(null);
	};

	const removeSkinIndex = (sknIdx: number) => {
		skins.splice(sknIdx, 1);
		let newSkins = [...skins];
		setSkins(newSkins);

		CharacterMgr.editChar({
			stories,
			story,
			dispatchStory: dispatch,
			characterIndex,
			skins: newSkins,
			imgUrl: newSkins[0]?.imgUrl || errorImg
		})
	}

	const [errObj, setErrObj] = useState<any>();
	const [uploadPercent, setUploadPercent] = useState(0);
	const [openUploadingModal, setOpenUploadingModal] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [selectedSkinIndex, setSelectedSkinIndex] = useState<number>(0);

	const uploadSkinImgs = (ev: React.ChangeEvent<HTMLInputElement>, sknIdx: number) => {
		console.log('uploadSkinImgs', ev.target.files, 'isUploading ? ', isUploading);

		if (isUploading) return;

		let files = ev.target.files;
		if (!files?.length) {
			_changeSkinUrl(errorImg, sknIdx);
			return;
		}

		setErrObj(undefined);
		setOpenUploadingModal(true);
		setUploadPercent(0);
		setIsUploading(true);

		uploadImage(
			Array.from(files),
			(uploadedUrls) => {
				setErrObj(undefined);
				setIsUploading(false);
				let newSkins = [...skins];

				uploadedUrls.forEach((url, i) => {
					if (i === 0) {
						_changeSkinUrl(url, sknIdx);
						return;
					}
					newSkins.push({
						imgUrl: url,
						settings: undefined,
						id: 'skin-' + (newSkins.length - 1),
					});
				});

				setSkins(newSkins);
				CharacterMgr.editChar({
					stories,
					story,
					delayS: 1,
					dispatchStory: dispatch,
					characterIndex,
					skins: newSkins,
				});
				setOpenUploadingModal(false);
			},
			(err) => {
				setUploadPercent(0);
				setOpenUploadingModal(false);
				setIsUploading(false);
				setErrObj({
					message: err?.message || 'unknown'
				});
			},
			(progress) => {
				setUploadPercent(progress);
			}
		);
	}

	function focusOnSkin(i: number) {
		setSelectedSkinIndex(i);
		EvtMgr.emit(EventName.demoModalChangeCharacterIndex, { characterIndex: characterIndex });
		EvtMgr.emit(EventName.demoModalChangeSkinIndex, { skinIndex: i });
	}

	if (!character) {
		return <DialogCard
			{...other}
			className="character-settings-sub-dialog"
			headerLabel={tDia('title')}
		>
			<Alert severity="error">
				{tError('noCharacterAtIndex', { index: characterIndex })}
			</Alert>
		</DialogCard>
	}
	return <DialogCard
		{...other}
		className="character-settings-sub-dialog"
		headerLabel={tDia('title')}
		collapsible={false}
	>
		<Modal
			open={openUploadingModal}
			onClose={ev => console.log('NO AUTO CLOSE')}
			aria-labelledby="modal-modal-title"
			aria-describedby="modal-modal-description"
		>
			<FlexBox sx={uploadingModalStyle}>
				<CircularProgressWithLabel value={uploadPercent} />
				<AutoVerticalAlignTypography sx={{ ml: '15px' }}>{t('common.uploading')}...</AutoVerticalAlignTypography>
			</FlexBox>
		</Modal>
		<Box sx={{ overflowY: 'auto', maxHeight: '70vh', m: '5px 5px' }}>
			<Box sx={{ mt: '5px' }}>
				<TextField
					label={tDia('characterName')}
					value={charName}
					onChange={_onChangeCharName}
					InputLabelProps={{
						sx: {
							color: 'var(--black)',
						}
					}}
					InputProps={{
						sx: {
							color: 'var(--black)',
							'& .MuiOutlinedInput-notchedOutline': {
								borderColor: 'var(--black)',
							},
						}
					}}
				/>
			</Box>
			{
				errObj?.message
					? <Alert severity={'error'}>
						{t('errorMessage.uploadAssetErrorWithExtra', { extraErrorMessage: errObj?.message })}
					</Alert>
					: null
			}
			<Divider />
			<Box sx={{}}>
				{
					skins?.length ? null
						: <Box sx={{ textAlign: 'center' }}>
							<Typography sx={{
								m: 'auto',
								fontStyle: 'italic',
								color: 'var(--black)',
							}}>
								{t('common.soEmpty')}
							</Typography>
						</Box>
				}
				{
					skins?.map((eachS, i) => {
						return <FlexBox key={i} sx={{
							...eachSkinContainerStyle,
							border: selectedSkinIndex === i ? '2px solid blue' : '2px solid #ccc'
						}} onPointerDown={ev => focusOnSkin(i)}>
							<Box sx={{ width: '100%' }}>
								<Box sx={{ mb: '10px', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
									<TextField
										label={tDia('characterSkin')}
										value={eachS.id}
										onChange={ev => _onChangeSkinId(ev.target.value, i)}
										InputLabelProps={{
											sx: {
												color: 'var(--black)',
											}
										}}
										InputProps={{
											sx: {
												color: 'var(--black)',
												'& .MuiOutlinedInput-notchedOutline': {
													borderColor: 'var(--black)',
												},
											}
										}}
									/>
									{/* Preview Image */}
									<Box sx={{ width: 'auto', display: 'flex', justifyContent: 'center' }}>
										<img
											src={eachS.imgUrl}
											alt={eachS.id}
											style={{
												maxWidth: '120px',
												maxHeight: '120px',
												objectFit: 'contain',
												borderRadius: '10px',
												transition: selectedSkinIndex === i ? 'all 0.3s' : 'none',
												width: selectedSkinIndex === i ? '60px' : '120px',
												height: selectedSkinIndex === i ? '60px' : '120px',
												boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
											}}
										/>
									</Box>
									{/* Delete Skin Button */}
									<IconButton
										sx={{
											backgroundColor: 'white',
											borderRadius: '10px',
											boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
										}}
										onPointerDown={ev => handleDeleteClick(i)}
									>
										<DeleteIcon sx={{ color: 'red' }} />
									</IconButton>
								</Box>
								{selectedSkinIndex === i
									? (
										<Box sx={{ mt: '-15px' }}>
											<Box sx={{ width: '100%' }}>
												<ImageUrlInput
													title={tDia('characterSkinImage')}
													value={eachS.imgUrl}
													onChange={url => _changeSkinUrl(url, i)}
													onAssetStore={() => onClickOpenAssetStore(null, i)}
													placeholder={t('common.enterImageURL')}
												/>
											</Box>
											<Box sx={{ width: '100%', p: '5px 15px 5px 15px' }}>
												<CharacterSkinSetting eachSkin={eachS} skinIndex={i} onChange={newSettings => onChangeSkinSetting(newSettings, i)} />
											</Box>
										</Box>
									)
									: <></>
								}
							</Box>
						</FlexBox>
					})
				}
			</Box>
			<FlexCenterBox>
				<Button variant="contained" size="large" onPointerDown={addEmptySkin} startIcon={<AddIcon />}>
					{t('dialogs.characterSettings.addCharacterSkin')}
				</Button>
			</FlexCenterBox>
		</Box>
		<Dialog
			open={deleteConfirmOpen}
			onClose={handleDeleteCancel}
		>
			<DialogTitle>{tDia('confirmDeleteTitle')}</DialogTitle>
			<DialogContent>
				<Typography>{tDia('confirmDeleteMessage')}</Typography>
			</DialogContent>
			<DialogActions>
				<Button onClick={handleDeleteCancel}>{t('common.cancel')}</Button>
				<Button onClick={handleDeleteConfirm} color="error">{t('common.delete')}</Button>
			</DialogActions>
		</Dialog>
	</DialogCard>
}

const eachSkinContainerStyle: SxProps = {
	borderRadius: '10px',
	border: '2px solid blue',
	mt: '5px',
	mb: '8px',
	p: '15px 5px'
}

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
