import React from "react";
import {AssetItem, LayoutMode} from "./asset-store-type-def";

type AssetStoreContextType = {
	assetItems: AssetItem[],

	myAssetLayout: LayoutMode,
	clickMyAssetItem: (ev, i: number) => void,

	storeAssetLayout: LayoutMode,
}

// @ts-ignore
const AssetStoreContext = React.createContext<AssetStoreContextType>(null);
export { AssetStoreContext };
