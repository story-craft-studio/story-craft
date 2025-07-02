import Network from "../network-handler/network";
import {AssetDTO, UploadAssetDesc} from "./asset-typedef";
import StringUtil from "../../util/StringUtil";
import EvtMgr, {EventName} from "../evt-mgr";
import _ from "lodash";
import CommonUtils from "../../util/CommonUtils";

export default class AssetMgr {
	private static alls: AssetDTO[] = [];
	private static updateAttempt: number = 0;

	static {
		EvtMgr.on(EventName.authLoggedIn, () => {
			console.log('AssetMgr loadOwnAssets after logged in');
			this.loadOwnAssets().then((assets) => {
				console.log('AssetMgr got assets', assets);
			}).catch(err => {
				console.error('loadOwnAssets error', err);
			});
		})
	}

	private static async loadOwnAssets() {
		let res = await Network.withServerStaticAsset().queryAssets();
		this.alls = res.map(each => {
			return {
				name: each.name,
				assetType: each.assetType,
				assetId: each.id,
				// ownerId: each.ownerId,
				relativeLink: each.path,
				// createTime: each.createTime,
			}
		})
		return res;
	}

    static getAlls(args?: { useCache: boolean }) : AssetDTO[] {
		return this.alls;
    }


	static async uploadMultipleAsset(assetDescs: UploadAssetDesc[], option?: {
		progressCb: (doneIdx: number) => void;
	}): Promise<{ successRes: any[]; errRes: any[] }> {
		let successRes: any[] = [];
		let errRes: any[] = [];

		for (let i = 0; i < assetDescs.length; i++) {
			let asset = assetDescs[i];

			await this.uploadAsset(asset, {ignoreDispatchEvent: true})
				.then(res => {
					successRes.push(res);
					console.log('upload file ', asset.name, ' at ', i, 'success! ');
					_.isFunction(option?.progressCb) && option?.progressCb(i);
				})
				.catch(err => {
					console.error('upload file ', asset.name, ' at ', i, 'got error', err);
					errRes.push(err)
				});

			// use this to debug the progress callback
			// await CommonUtils.sleep(2000);
		}

		if (successRes.length > 0) {
			EvtMgr.emit(EventName.assetChange);
		}

		return {
			successRes,
			errRes
		};
	}

	static async uploadAsset(assetDesc: UploadAssetDesc, option?: { ignoreDispatchEvent?: boolean }) {
		let res = await Network.withServerStaticAsset().uploadAsset(assetDesc);
		console.log('uploadAsset', res);

		let relativeLink = res.relativeLink;
		let assetId = res.assetId;

		this._save({
			name: assetDesc.name,
			assetType: assetDesc.assetType,
			relativeLink,
			assetId
		});

		if (!option?.ignoreDispatchEvent)
			EvtMgr.emit(EventName.assetChange);

		return res;
	}

	private static _save(newAsset: AssetDTO) {
		this.alls.push(newAsset);
		this.alls = [...this.alls];
	}

	static getAssetWithName(name: string): AssetDTO | undefined {
		return this.alls.find(anyA => anyA.name === name);
	}

	static toRealUrl(relativeLink: string) {
		if (!relativeLink) return '';
		let pathSep = StringUtil.getPathSeparator(relativeLink);
		if (!relativeLink.startsWith(pathSep)) {
			relativeLink = pathSep + relativeLink;
		}
		return Network.withServerStaticAsset().getServerUrlWithOutEndingPathSeperator() + '/asset' + relativeLink;
	}
}
