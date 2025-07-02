import {LoginType, SocialType} from "../network-handler/server-static-asset";
import {LoggedInUser} from "./auth-type-def";
import Network from "../network-handler/network";
import ProcessEnvMgr from "../ProcessEnvMgr";
import GuestAuthModule from "./GuestAuthModule";
import SocialAuthModule from "./SocialAuthModule";
import AbstractAuthModule from "./AbstractAuthModule";

let _currentUser: LoggedInUser | undefined;

class _Auth {
	_socialLoginMethodNames: SocialType[] | undefined = undefined;
	private _loginType: LoginType | undefined;
	private authModule: AbstractAuthModule | undefined;

	constructor() {
		this.initAsync();
	}

	get loginType() {
		return this._loginType;
	}

	isLoginGuest() {
		return this.loginType === LoginType.GUEST;
	}

	async initAsync() {
		try {
			let loginType = await Network.withServerStaticAsset().getLoginType();
			console.log('loginType', loginType);
			this._loginType = loginType;
		} catch (e) {
			console.warn('Login was disabled cuz server asset wasnt ready to respond', e);
			return;
		}


		if (this.loginType === LoginType.GUEST) {
			this.authModule = new GuestAuthModule();
		} else {
			this.authModule = new SocialAuthModule();
		}

		this.authModule.setCurrentUser = this.setCurrentUser;
		this.authModule.getCurrentUser = this.getCurrentUser;

		this.authModule.start();
	}

	getCurrentUser() {
		return _currentUser;
	}

	setCurrentUser(whatever) {
		_currentUser = whatever;
	}


	async getCurrentUserInfo(): Promise<LoggedInUser | undefined> {
		return _currentUser;
	}

	isUnauthorizedError(err: Error) {
		return (err as any)?.status === 401;
	}

	async userReLogin(socialType: SocialType): Promise<void> {
		if (!this.authModule) {
			throw new Error('authModule hasnt done initializing');
		}
		await this.authModule.userReLogin(socialType);
	}

	async loadToken(socialType: SocialType, authenCode: string) {
		if (!this.authModule) {
			throw new Error('authModule hasnt done initializing');
		}
		await this.authModule.loadToken(socialType, authenCode);
	}

	private onLoggedIn() {
		if (!this.authModule) {
			throw new Error('authModule hasnt done initializing');
		}
		return this.authModule.onLoggedIn();
	}

	hadLoggedIn(): boolean {
		if (!this.authModule) {
			return false;
		}
		return this.authModule.hadLoggedIn();
	}

	public logout() {
        if (!this.authModule) {
          throw new Error('authModule hasnt done initializing');
        }
		this.authModule.logout();
	}

	getLoginToken() {
        if (!this.authModule) {
          throw new Error('authModule hasnt done initializing');
        }
		return this.authModule.getLoginToken();
	}

	get socialLoginMethodNames() {
		if (!this._socialLoginMethodNames) {
			this._socialLoginMethodNames = [];

			if (ProcessEnvMgr.useGGLogin())
				this._socialLoginMethodNames.push(SocialType.GOOGLE)

			if (ProcessEnvMgr.useFBLogin())
				this._socialLoginMethodNames.push(SocialType.FACEBOOK)

			if (ProcessEnvMgr.useAppleLogin())
				this._socialLoginMethodNames.push(SocialType.APPLE)
		}
		return this._socialLoginMethodNames;
	}

	getUsername() {
		return this.authModule?.getUsername() || "";
	}
}

const Auth = new _Auth();
export default Auth;
