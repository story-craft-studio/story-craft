import {AssetDTO} from "../asset-typedef";

export type AssetItem = AssetDTO & {}
export type LayoutMode = 'grid' | 'horiz';

export type AssetStoreModalPropsCloseArgs<T = {}> = T & {
	chooseMyAssetItem?: AssetItem,
}
