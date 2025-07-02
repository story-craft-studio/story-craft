import {LoginType, SocialType} from "../network-handler/server-static-asset";
import GoogleLoginHelper from "./login-helpers/google-login-helper";
import Network from "../network-handler/network";
import AbstractAuthModule from "./AbstractAuthModule";
import _, {isNaN} from "lodash";
import {LoggedInUser} from "./auth-type-def";
import {OpenAPI} from "../../_genApi/static-asset";

let isLoggingIn: boolean = false;


//TODO: REFRESH TOKEN
export default class SocialAuthModule extends AbstractAuthModule {
	loginType = LoginType.SOCIAL;
	constructor() {
		super();
	}


	start() {
		let prevAuthCre = this.readCachedUserInfo();
		if (!prevAuthCre) return;
		if (!prevAuthCre.zpsToken) return;
		if (_.isNil(prevAuthCre.expireAtMS)) return;
		if (isNaN(prevAuthCre.expireAtMS)) return;

		let expired = prevAuthCre.expireAtMS < Date.now();
		if (!expired) {
			OpenAPI.TOKEN = prevAuthCre.zpsToken;
			this.setCurrentUser(prevAuthCre);
			return;
		}
		console.warn('expired..');

		if (prevAuthCre.refreshToken) {
			this._tryRefreshToken(prevAuthCre.refreshToken);
			return;
		}
	}

	async _tryRefreshToken(refreshToken) {
		//TODO: SocialAuthModule _tryRefreshToken
		return;

		// let tokenInfos;
		// try {
		// 	tokenInfos = await GoogleLoginHelper.refreshToken(refreshToken);
		// } catch (err) {
		// 	console.error('uncaught error in GoogleLoginHelper.refreshToken..', err);
		// 	return;
		// }
		// if (!tokenInfos) return;
		//
		// let deviceId = this.getDeviceId();
		// let zpsTokenObj;
		// try {
		// 	zpsTokenObj = await Network.withServerUploadGame().getZPSToken(
		// 		tokenInfos.accessToken,
		// 		deviceId,
		// 		SocialType.GOOGLE
		// 	);
		// } catch (err) {
		// 	console.error('uncaught error in Network.withServerUploadGame().getZPSToken.', err);
		// 	return;
		// }
		// if (!zpsTokenObj) return;
		//
		// tokenInfos.zpsToken = zpsTokenObj.zpsToken;
		// if (!tokenInfos.zpsToken) {
		// 	console.error('FATAL in loadToken: zpsToken missing from zpsTokenObj', zpsTokenObj);
		// }
		//
		// let _curUser = this.getCurrentUser();
		//
		// let currentUser: LoggedInUser;
		// if (_curUser) currentUser = _curUser;
		// else currentUser = tokenInfos;
		//
		// currentUser.zpsUserId = zpsTokenObj.id;
		// currentUser.zpsUserAvatar = zpsTokenObj.avatar;
		// currentUser.zpsUsername = zpsTokenObj.name;
		// currentUser.zpsToken = zpsTokenObj.zpsToken;
		// console.log('Refreshed Token');
		// await this.onLoggedIn();
	}

	async userReLogin(socialType: SocialType) {
		console.log('SocialAuthModule userReLogin', socialType);

		if (isLoggingIn) {
			console.warn('WARN in userReLogin: Already in loggin process, ignored');
			return;
		}

		this.logout();
		isLoggingIn = true;
		try {
			switch (socialType) {
				case SocialType.GOOGLE:
					await GoogleLoginHelper.login(this.getDeviceId());
					break;

				default:
					console.error('FATAL in userReLogin: Unknown socialType', socialType);
					isLoggingIn = false;
					return;
			}
			isLoggingIn = false;
		} catch (e) {
			console.error('FATAL in userReLogin: login error with socialType', socialType, e);
			isLoggingIn = false;
		}
	}

	getLoginToken() {
		return this.getCurrentUser()?.zpsToken || '';
	}

	getUsername() {
		return this.getCurrentUser()?.zpsUsername || '';
	}

	hadLoggedIn() {
		let prevAuthCre = this.readCachedUserInfo();
		if (!prevAuthCre) return false;
		if (!prevAuthCre.zpsToken) return false;
		if (_.isNil(prevAuthCre.expireAtMS)) return false;
		if (isNaN(prevAuthCre.expireAtMS)) return false;

		let expired = prevAuthCre.expireAtMS < Date.now();
		return !expired;
	}

	loadToken(socialType, authenCode: string): void {
		//TODO: load token
	}
}

