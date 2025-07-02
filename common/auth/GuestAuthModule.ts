import {LoginType, SocialType} from "../network-handler/server-static-asset";
import Network from "../network-handler/network";
import {
	adjectives,
	animals,
	colors,
	countries,
	languages,
	names,
	starWars,
	uniqueNamesGenerator
} from "unique-names-generator";
import {AvatarGenerator} from "random-avatar-generator";
import AbstractAuthModule from "./AbstractAuthModule";
import StringUtil from "../../util/StringUtil";


const errGuestToken = 'err-unknown-err';

export default class GuestAuthModule extends AbstractAuthModule {
	loginType = LoginType.GUEST

	constructor() {
		super();
	}

	async start() {
		await this.loginAsGuest();
	}

	private async loginAsGuest() {
		let prevAuthCre = this.readCachedUserInfo();
		console.log('loginAsGuest... ', prevAuthCre);

		let guestToken = prevAuthCre?.guestToken || '';
		if (prevAuthCre?.loginType !== LoginType.GUEST) {
			prevAuthCre = undefined;
		}

		if (!prevAuthCre?.name || prevAuthCre?.guestToken === errGuestToken) {
			console.warn('No valid guest token', prevAuthCre, 're login with new guest account');
			let randomName = StringUtil.genRandomName();
			let randomAvatar = genRandomAvatar(randomName);

			try {
				guestToken = await Network.withServerStaticAsset().getGuestLoginToken();
				if (!guestToken.trim().toLowerCase().startsWith('guest_')) {
					guestToken = 'guest_' + guestToken;
				}
			} catch (e) {
				console.error('loginAsGuest failure cuz network error trying to get guest token', e);
				return;
			}

			this.setCurrentUser({
				name: randomName,
				avatar: randomAvatar,
				tokenType: 'guest',
				loginType: this.loginType,
				guestToken,
			});
		} else {
			this.setCurrentUser(prevAuthCre);
		}

		Network.withServerStaticAsset().setToken(guestToken);
		await this.onLoggedIn();
	}

	async userReLogin(socialType: SocialType) {
		console.log('GuestAuthModule userReLogin', socialType);
		await this.loginAsGuest();
	}

	hadLoggedIn() {
		let prevAuthCre = this.readCachedUserInfo();
		return !!prevAuthCre?.name;
	}

	getLoginToken() {
		return this.getCurrentUser()?.guestToken || '';
	}

	async loadToken(socialType: SocialType, authenCode: string) {
		console.error('Guestlogin not supposed to call loadToken, stack = ', new Error());
	}

	getUsername(): string {
		return this.getCurrentUser()?.name || '';
	}
}

const generator = new AvatarGenerator();

function genRandomAvatar(seed: string = '') {
	return generator.generateRandomAvatar(seed);
}
