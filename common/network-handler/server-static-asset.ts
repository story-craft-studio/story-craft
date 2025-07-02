import {ServerHandler} from "./server-handler";
import {AssetType, DefaultService, OpenAPI,} from "../../_genApi/static-asset";
import AppConfig from "../../app-config";

export enum LoginType  {
	GUEST = 'guest',
	SOCIAL = 'social'
}

export enum SocialType {
	GUEST,
	GOOGLE,
	FACEBOOK,
	APPLE,
}

export class ServerStaticAsset extends ServerHandler {
	private _serverUrl: string = "";

	constructor() {
		super();
		OpenAPI.BASE = this.getServerUrl();
	}

	getServerUrl(): string {
		if (!this._serverUrl) {
			let isLive = this.isLive();
			let url: string = (isLive)
				? AppConfig.get('APP_LIVE_SERVER_URL')
				: AppConfig.get('APP_DEV_SERVER_URL');
			this._serverUrl = url || '';
		}
		return this._serverUrl || '';
	}

	getStudioBaseUrl(): string {
		let isLive = this.isLive();
		let url: string = (isLive)
			? AppConfig.get('APP_LIVE_SERVER_URL') + '/create'
			: AppConfig.get('STUDIO_DEV_URL');
		return url || '';
	}

	isLive(): boolean {
		return AppConfig.get('APP_MODE') === 'LIVE';
	}


	getServerUrlWithOutEndingPathSeperator(): string {
		let url = this.getServerUrl();
		if (url.endsWith('/')) return url.substring(0, url.length - 1);
		return url;
	}

	async getLoginType(): Promise<LoginType> {
		return LoginType.GUEST;

		//TODO:
		// let loginTypeRespondBody = await DefaultService.getLoginType();
		// return loginTypeRespondBody?.type;
	}

	async getGuestLoginToken(): Promise<string> {
		return DefaultService.getApiGetGuestToken();
	}

	uploadAsset(args: {
		assetType: AssetType,
		file: File,
		fileExtension: string,
		name: string
	}) {

		return DefaultService.postApiUploadNewAsset(args);
	}

	setToken(token: string) {
		console.log('token', token);
		OpenAPI.TOKEN = token;
	}

	async queryAssets() {
		return DefaultService.postApiBrowseMyAsset({
			minId: 0,
			numTake: 100,
		})
	}
}
