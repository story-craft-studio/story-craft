import {AssetType} from "../../_genApi/static-asset";

export type AssetDTO = {
	name: string,
	assetType: AssetType,
	relativeLink: string,
	assetId: number,
}
export type UploadAssetDesc = {
	assetType: AssetType,
	file: File,
	fileExtension: string,
	name: string
};
