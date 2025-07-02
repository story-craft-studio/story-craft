import {Box, SxProps} from "@mui/material";
import * as React from "react";
import {HTMLAttributes, useContext, useEffect, useState} from "react";
import AssetMgr from "../asset-mgr";
import StringUtil from "../../../util/StringUtil";
import {AssetType} from "../../../_genApi/static-asset";
import Tooltip from "@mui/material/Tooltip";
import {Item} from "./item";
import {AssetStoreContext} from "./asset-store-context";

const errorImg = '/common/imgs/image-not-found.png';

export function ItemList() {
	const {
		assetItems,
		myAssetLayout,
		clickMyAssetItem,
	} = React.useContext(AssetStoreContext);

	const [actualImgUrls, setActualImgUrls] = useState<string[]>([]);
	useEffect(() => {
		setActualImgUrls(
			assetItems.map(eachItem => {
				if (!eachItem.relativeLink) return errorImg;
				return AssetMgr.toRealUrl(eachItem.relativeLink)
			})
		);
	}, [assetItems]);

	const [endOfUrls, setEndOfUrls] = useState<string[]>([]);
	useEffect(() => {
		setEndOfUrls(
			assetItems.map(eachItem => {
				return StringUtil.getEndFileOrFolderName(eachItem.relativeLink);
			})
		);
	}, [assetItems]);

	const [sxItemPropsLayout, setSxItemPropsLayout] = useState<SxProps>({});
	useEffect(() => {
		if (myAssetLayout === 'grid') {
			setSxItemPropsLayout({
				width: '100%',
				height: '80px',
			})
			return;
		}

		setSxItemPropsLayout({
			width: '100%',
			height: '80px',
			mt: '15px',
			mb: '30px'
		})
	}, [myAssetLayout]);

	return <>
		{
			assetItems.map((eachItem, i) => {
				let isAudio = eachItem.assetType === AssetType.AUDIO;
				let isImg = eachItem.assetType === AssetType.IMAGE;
				let isNeither = !isAudio && !isImg;

				let tooltipText = eachItem.name + ' (' + endOfUrls[i] + ')';
				return <Box sx={{
					width: '100%',
					height: '80px',
				}} key={i}>
					<Tooltip title={tooltipText} arrow>
						<Item
							assetItem={eachItem}
							onPointerDown={ev => clickMyAssetItem(ev, i)}
							isAudio={isAudio}
							isImg={isImg}
							isNeither={isNeither}

							actualUrls={actualImgUrls}
							index={i}
							tooltipText={tooltipText}
							onError={() => {
								if (actualImgUrls[i] === errorImg) return;
								console.error('cant get img at url', actualImgUrls[i]);
								actualImgUrls[i] = errorImg;
								setActualImgUrls([...actualImgUrls]);
							}}
						/>
					</Tooltip>
				</Box>
			})
		}
	</>;
}

