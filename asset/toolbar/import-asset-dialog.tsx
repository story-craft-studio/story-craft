import * as React from 'react';
import {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {CardContent} from '../../components/container/card';
import {DialogCard, DialogCardProps} from '../../components/container/dialog-card';
import './ImportAssetDialog.css';
import {AssetType} from "../../_genApi/static-asset";
import StringUtil from "../../util/StringUtil";
import Alert from '@mui/material/Alert';
import {useErrorMessageTranslation} from "../../util/translation-wrapper";
import {Box, Button, CircularProgress, Divider, TextField, Typography} from "@mui/material";
import {FlexCenterBox} from '../../common/template/mui-template/flex-box';
import LifeTimeController from "../../util/life-time-controller";
import AssetMgr from "../../common/asset/asset-mgr";

function genRandomName() {
	return StringUtil.genRandomName({wordCount: 2, separator: '-'});
}

type ErrObj = {
	message: string,
	errInfo?: string,
}

enum ErrorType {
	unclassified,
	assetNameCantBeEmpty,
}

export const ImportAssetDialog: React.FC<
	Omit<DialogCardProps, 'headerLabel'>
> = props => {

	const {t} = useTranslation();
	const {tError} = useErrorMessageTranslation();

	const [errMaps, setErrMaps] = useState<Map<ErrorType, ErrObj>>(new Map());

	const [assetName, setAssetName] = useState( genRandomName() + '-image');
	const [assetType, setAssetType] = useState<AssetType>(AssetType.IMAGE);
	const [fileExt, setFileExt] = useState('png');
	const [file, setFile] = useState<File | null>(null);
	useEffect(() => {
		let trim = StringUtil.trimWhiteSpaceAndTab(assetName);
		if (!trim.length) {
			errMaps.set(ErrorType.assetNameCantBeEmpty, {
				message: 'assetNameCantBeEmpty'
			});
		}
		else {
			errMaps.delete(ErrorType.assetNameCantBeEmpty);
		}

		setErrMaps(new Map(errMaps));
	}, [assetName]);

	function changeAssetName(ev) {
		setAssetName(ev.target.value);
	}
	function changeAssetType(ev) {
		setAssetType(ev.target.value);
	}

	const fileInputRef = useRef<HTMLInputElement>(null);
	const onFileInputChange = (fileList: FileList | null) => {
		if (!fileList || !fileList?.length) {
			setFile(null);
			return;
		}

		setFile(fileList.item(0));
	};

	useEffect(() => {
		if (!file) return;

		let fileName = file.name;
		let isImgFile = StringUtil.isImageFileName(fileName);
		let isAudio = StringUtil.isAudio(fileName);
		let newFileExt = StringUtil.getFilePathExtension(fileName);
		console.log(
			'fileName', fileName,
			'isImgFile', isImgFile,
			'isAudio', isAudio,
			'newFileExt', newFileExt,
		);

		setFileExt(newFileExt);
		if (!newFileExt) {
			errMaps.set(ErrorType.unclassified, {
				message: 'fileNameIsMissingExtension'
			})
		}
		else {
			errMaps.delete(ErrorType.unclassified);
		}
		setErrMaps(new Map(errMaps));

		if (!assetName && isImgFile) {
			const newAssetName = 'image-' + fileName;
			setAssetName(newAssetName);
		}

		if (!assetName && isAudio) {
			const newAssetName = 'audio-' + fileName;
			setAssetName(newAssetName);
		}

		if (isImgFile) {
			setAssetType(AssetType.IMAGE);
			return;
		}

		if (isAudio) {
			setAssetType(AssetType.AUDIO);
			return;
		}
		console.warn('Unknown file type, is it Image or Audio ?');
	}, [file]);

	const submit = (ev) => {
		if (cantUpload()) return;

		setIsSubmiting(true);

		AssetMgr.uploadAsset({
			assetType,
			file: file as File,
			name: assetName,
			fileExtension: fileExt
		}, {ignoreDispatchEvent: true}).then(res => {
			setUploadDoneMsg('common.done');
			dialogLifeTime.after(1.5).execute(() => {
				props.onClose();
			})

			setIsSubmiting(false);
			console.log('upload result ', res);
		}).catch(err => {
			setIsSubmiting(false);
			console.error('Upload failure ', err, JSON.stringify(err));

			errMaps.set(ErrorType.unclassified, {
				message: 'uploadAssetError',
				errInfo: err?.message || JSON.stringify(err) || ''
			})
			setErrMaps(new Map(errMaps));
		})
	}
	const cantUpload = () => {
		if (errMaps.size) return true;
		if (!file) return true;

		return isSubmiting;
	}

	//#region upload process
	//==========================
	const [isSubmiting, setIsSubmiting] = useState(false);
	const [uploadDoneMsg, setUploadDoneMsg] = useState('');
	const [dialogLifeTime, setDialogLifeTime] = useState(LifeTimeController.create());
	useEffect(() => {
		return () => {
			dialogLifeTime.deleteAllCbs();
		}
	}, []);
	//#endregion

	return (
		<DialogCard
			{...props}
			collapsible={false}
			className="import-asset-dialog"
			fixedSize
			headerLabel={t('dialogs.importAsset.title')}
		>
			<CardContent style={{display: 'block'}}>
				<Box className="input-container">
					<div className="table-container">
						<table>
							<tbody>
							<tr className="parameters" data-property-name="name">
								<td className="parameters-col_name">
									<div className="parameter__name required">Asset Name</div>
								</td>
								<td className="parameters-col_description">
									<div>
										<TextField
											error={errMaps.has(ErrorType.assetNameCantBeEmpty)}
											helperText={
												errMaps.has(ErrorType.assetNameCantBeEmpty)
													? tError('assetNameCantBeEmpty')
													: ''
											}
											placeholder="name"
											value={assetName}
											onChange={changeAssetName}
										/>
									</div>
								</td>
							</tr>
							<tr className="parameters" data-property-name="assetType">
								<td className="parameters-col_name">
									<div className="parameter__name required">Asset type</div>
								</td>
								<td className="parameters-col_description">
									<div>
										<select className="" value={assetType} onChange={changeAssetType}>
											{
												Object.entries(AssetType).map(eachEntry =>
													<option value={eachEntry[1]} key={eachEntry[0]}>{eachEntry[0]}</option>
												)
											}
										</select>
									</div>
								</td>
							</tr>
							<tr className="parameters" data-property-name="fileExtension">
								<td className="parameters-col_name">
									<div className="parameter__name required">File extension</div>
								</td>
								<td className="parameters-col_description">
									<div>
										<input type="text" disabled className="" title="" placeholder="fileExtension" readOnly value={fileExt}/>
									</div>
								</td>
							</tr>
							<tr className="parameters" data-property-name="file">
								<td className="parameters-col_name">
									<div className="parameter__name required">File</div>
								</td>
								<td className="parameters-col_description">
									<div>
										<input type="file"
										       ref={fileInputRef}
										       className="" title=""
										       onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
											       onFileInputChange(e.target.files);
										       }}
										/>
									</div>
								</td>
							</tr>
							</tbody>
						</table>
					</div>
				</Box>
				{
					errMaps.get(ErrorType.unclassified)?.message
						? <Alert severity="error">
							{
								tError(
									errMaps.get(ErrorType.unclassified)?.message,
									{
										errInfo: errMaps.get(ErrorType.unclassified)?.errInfo,
									}
								)
							}
						</Alert>
						: null
				}
				<Divider/>
				<FlexCenterBox sx={{p: '5px 10px'}}>
					{
						!uploadDoneMsg
							? isSubmiting ? <CircularProgress />
								: <Button
									disabled={cantUpload()}
									variant={"contained"}
									onPointerDown={submit}>
									{t('common.submit')}
								</Button>
							: <Typography>
								{t(uploadDoneMsg)}
							</Typography>
					}
				</FlexCenterBox>
			</CardContent>
		</DialogCard>
	)
};
