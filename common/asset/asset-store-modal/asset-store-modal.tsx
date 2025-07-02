import Modal from "@mui/material/Modal";
import {Box, Button, TextField, Typography} from "@mui/material";
import * as React from "react";
import {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {useComponentTranslation} from "../../../util/translation-wrapper";
import GridViewIcon from '@mui/icons-material/GridView';
import TableRowsIcon from '@mui/icons-material/TableRows';
import AssetMgr from "../asset-mgr";
import _ from "lodash";
import {FlexBox} from "../../template/mui-template/flex-box";
import {AssetItem, AssetStoreModalPropsCloseArgs, LayoutMode} from "./asset-store-type-def";
import {ItemList} from "./item-list";
import {AssetStoreContext} from "./asset-store-context";
import EvtMgr, {EventName} from "../../evt-mgr";
import {ImportAssetDialog} from "../../../asset/toolbar/import-asset-dialog";
import {useDialogsContext} from "../../../dialogs";


const modalContentStyle = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 500,
	bgcolor: 'background.paper',
	border: '2px solid #000',
	boxShadow: 24,
	p: 4,
};

export default function AssetStoreModal<T = {}>(props: {
	open: boolean,
	onClose: (args?: AssetStoreModalPropsCloseArgs<T>) => void,
	args?: T,
}) {
	const {dispatch} = useDialogsContext();
	const {t} = useTranslation();
	const {tComp} = useComponentTranslation('assetStoreModal');

	const [layout, setLayout] = useState<LayoutMode>('grid');

	const [assetItems, setAssetItems] = useState<AssetItem[]>([]);
	const reloadAssets = () => {
		let newItems = AssetMgr.getAlls().map(eachDTO => {
			return eachDTO;
		});

		setAssetItems(
			_.uniqWith(newItems, (itemA, itemB) => {
				return itemA.relativeLink === itemB.relativeLink
			})
		);
	}

	useEffect(() => {
		reloadAssets();
		EvtMgr.on(EventName.assetChange, reloadAssets);
		return () => {
			EvtMgr.off(EventName.assetChange, reloadAssets);
		}
	}, []);

	const onItemClick = (ev, i) => {
		let extraArgs = _.isObject(props.args) ? props.args : {} as T;
		props.onClose({
			chooseMyAssetItem: assetItems[i],
			...extraArgs,
		})
	}

	const closeEruptly = () => {
		props.onClose();
	}

	return <Modal
		open={props.open}
		onClose={closeEruptly}
		aria-labelledby="modal-modal-title"
		aria-describedby="modal-modal-description"
	>
		<Box sx={modalContentStyle}>
			<AssetStoreContext.Provider value={{
				assetItems,
				myAssetLayout: layout,
				clickMyAssetItem: onItemClick,
				storeAssetLayout: 'grid',
			}}>
				<FlexBox sx={{mb: '30px'}}>
					<Box sx={{width: '65%', mr: '5%'}}>
						<TextField
							sx={{
								width: '100%',
							}}
							slotProps={{
								input: {
									sx: {height: '45px'}
								}
							}}
						/>
					</Box>
					<Box sx={{width: '30%'}}>
						<Button variant='contained'
								sx={{
									color: 'black',
									height: '45px',
									background: '#40df51',
									borderRadius: '27px',
								}}
								onPointerDown={() => {
									closeEruptly();
									dispatch({type: 'addDialog', component: ImportAssetDialog, centerScreen: true});
								}}
						>
							{t('common.upload')}
						</Button>
					</Box>
				</FlexBox>
				<Box>
					<FlexBox sx={{mb: '20px'}}>
						<Typography sx={{mr: '5px'}}>{tComp('myUploads')}</Typography>
						<GridViewIcon onPointerDown={ev => setLayout('grid')}/>
						<TableRowsIcon onPointerDown={ev => setLayout('horiz')}/>
					</FlexBox>
					<Box
						className={'asset-store-item-list'}
						sx={{
							display: layout === 'grid' ? 'grid' : 'inline-block',
							gridTemplateColumns: layout === 'grid' ? '1fr 1fr 1fr 1fr' : 'none',
							rowGap: '0',
							columnGap: '8px',
							overflowY: 'auto',
							height: '300px',
							width: '100%',
						}}
					>
						<ItemList/>
					</Box>
				</Box>
			</AssetStoreContext.Provider>
		</Box>
	</Modal>;
}
