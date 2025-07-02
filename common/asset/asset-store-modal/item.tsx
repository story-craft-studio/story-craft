import {Box, CardContent, SxProps, Typography} from "@mui/material";
import VolumeDownIcon from "@mui/icons-material/VolumeDown";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import * as React from "react";
import {AssetStoreContext} from "./asset-store-context";
import {AssetItem} from "./asset-store-type-def";
import { FlexCenterBox } from "../../template/mui-template/flex-box";

type ItemProp = {
	assetItem: AssetItem,
	isAudio: boolean,
	isImg: boolean,
	isNeither: boolean,
	onPointerDown: (ev) => void,
	actualUrls: string[],
	index: number,
	tooltipText: string,
	onError: () => void,
}

function ItemComponent (props: ItemProp, ref) {
	const {
		myAssetLayout,
	} = React.useContext(AssetStoreContext);

	let partialProps: any = {...props};
	delete partialProps.assetItem;
	delete partialProps.isAudio;
	delete partialProps.isNeither;
	delete partialProps.isImg;
	delete partialProps.actualUrls;
	delete partialProps.tooltipText;
	delete partialProps.index;
	delete partialProps.onError;

	return <Box
		{...partialProps}
		ref={ref}

		className='asset-store-item'
		sx={{
			boxShadow: 1,
			borderRadius: '2px',
			width: "100%",
			height: myAssetLayout === 'grid' ? '100%' : '80px',
			display: 'flex'
		}}
		onPointerDown={props.onPointerDown}
	>
		{
			myAssetLayout === 'grid' ? null
				: <Box sx={{width: '65%'}}>
					<Typography sx={{width: '100%'}} component={'div'}>{props.assetItem.name}</Typography>

					<Typography sx={{width: '100%', fontWeight: 'bold'}}
					            component={'div'}
					>
						{props.assetItem.assetType}
					</Typography>
				</Box>
		}
		<Icon
			sx={{
				ml: myAssetLayout === 'grid' ? 0 : '15px',
				width: myAssetLayout === 'grid' ? '100%' : '30%',
			}}
			isAudio={props.isAudio}
			isImg={props.isImg}
			isNeither={props.isNeither}

			urls={props.actualUrls}
			index={props.index}
			alt={props.tooltipText}
			onError={props.onError}
		/>
	</Box>;
};

function Icon(props: {
	sx?: SxProps,
	isAudio: boolean,
	isImg: boolean,
	urls: string[],
	index: number,
	alt: string,
	onError: () => void,
	isNeither: boolean
}) {

	return <FlexCenterBox sx={props.sx || undefined}>
		{
			props.isAudio
				? <Box sx={{m: 'auto'}}>
					<VolumeDownIcon sx={{width: '100%'}}/>
				</Box>
				: null
		}
		{
			props.isImg
				? <img
					srcSet={props.urls[props.index]}
					src={props.urls[props.index]}
					alt={props.alt}
					loading="lazy"
					onError={props.onError}

					style={{
						width: "100%",
						height: "100%",
						objectFit: "cover",
					}}
				/>
				: null
		}

		{/*NO FUCKING WAY !!!*/}
		{
			props.isNeither
				? <HelpOutlineIcon sx={{width: '100%'}}/>
				: null
		}
	</FlexCenterBox>;
}

const Item = React.forwardRef(ItemComponent);
export {Item};
