import {LocalStorageKeys} from "../LocalStorageKeys";
import EvtMgr, {EventName} from "../evt-mgr";
import {LoggedInUser} from "./auth-type-def";
import {LoginType, SocialType} from "../network-handler/server-static-asset";

export default abstract class AbstractAuthModule {
	loginType: LoginType | undefined;

	setCurrentUser = (whatever: LoggedInUser | undefined) => {
		console.log('forgot to wire me ?');
	}

	getCurrentUser = (): LoggedInUser | undefined => {
		console.log('forgot to wire me ?');
		return undefined
	}

	getDeviceId() {
		const cachedDeviceId = localStorage.getItem(LocalStorageKeys.DEVICE_ID_KEY);
		if (cachedDeviceId) {
			return cachedDeviceId;
		}

		const deviceId = btoa(Array(32).fill('').map(() => String.fromCharCode(Math.floor(Math.random() * 0xff))).join(''));
		localStorage.setItem(LocalStorageKeys.DEVICE_ID_KEY, deviceId);
		return deviceId;
	}


	readCachedUserInfo(): LoggedInUser | undefined {
		let prevAuthCreAsJson = localStorage.getItem(LocalStorageKeys.CURRENT_USER_INFO_LOCAL_STORAGE_KEY) || '';
		let prevAuthCre: LoggedInUser | undefined = undefined;
		if (prevAuthCreAsJson) {
			try {
				prevAuthCre = JSON.parse(prevAuthCreAsJson);
			} catch (e) {
				console.error('localstorage item at CURRENT_USER_INFO_LOCAL_STORAGE_KEY is not a valid json:', e, prevAuthCreAsJson);
			}
		}

		if (!prevAuthCre) return undefined;

		if (this.loginType !== prevAuthCre.loginType) {
			return undefined
		}

		return prevAuthCre;
	}

	async onLoggedIn() {
		let _currentUser = this.getCurrentUser();
		if (!_currentUser) {
			console.error('WTF, dont call onLoggedIn when "getCurrentUser" still returning nil');
			return;
		}
		EvtMgr.emit(EventName.authLoggedIn, {user: _currentUser});
		localStorage.setItem(LocalStorageKeys.CURRENT_USER_INFO_LOCAL_STORAGE_KEY, JSON.stringify(_currentUser));

		let userName = _currentUser.zpsUsername || _currentUser.name || '';
		let userId = this.getDeviceId();
		if (userName && userId) {
			document.cookie = `username=${userName}; userId=${userId}; SameSite=Lax; Secure`;
		} else {
			document.cookie = '';
		}
	}

	logout() {
		localStorage.removeItem(LocalStorageKeys.CURRENT_USER_INFO_LOCAL_STORAGE_KEY);
		this.setCurrentUser(undefined);
		EvtMgr.emit(EventName.authLoggedOut);
	}

	abstract start(): void;
	abstract userReLogin(socialType: SocialType): void;
	abstract getLoginToken(): string;
	abstract hadLoggedIn(): boolean;
	abstract loadToken(socialType: SocialType, authenCode: string): void;
	abstract getUsername(): string;
}
