import {SocialType} from "../../network-handler/server-static-asset";
import AppConfig from "../../../app-config";

const GOOGLE_LOGIN_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'; //https://www.googleapis.com/oauth2/v4/token';

// Use configuration instead of hardcoded credentials for security
const CLIENT_ID: string = AppConfig.get('GOOGLE_CLIENT_ID');
const CLIENT_SECRET: string = AppConfig.get('GOOGLE_CLIENT_SECRET');

const SCOPE = 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';

const GET_USER_INFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';


export default class GoogleLoginHelper {

  static async login(deviceId: string) {
    await this.getAuthenCode(deviceId);
  }

  static async getAuthenCode(deviceId: string) {
    let redirectUri = this.getRedirectOrigin();
    redirectUri += '/login/google/redirect';
    //console.log('redirectUri, ', redirectUri);

    let oauth2Endpoint = GOOGLE_LOGIN_ENDPOINT;

    let form = document.createElement('form');
    form.setAttribute('method', 'GET');
    form.setAttribute('action', oauth2Endpoint);

    let params = {
      access_type: 'offline',
      client_id: CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: SCOPE, //'https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/calendar.readonly',
      include_granted_scopes: 'true',
      state: 'pass-through value',
    };

    for (let p in params) {
      let input = document.createElement('input');
      input.setAttribute('type', 'hidden');
      input.setAttribute('name', p);
      input.setAttribute('value', params[p]);
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
  }

  static async getGoogleToken(authenCode: string): Promise<{
    zpsToken: string;
    accessToken: any;
    scope: any;
    tokenType: any;
    refreshToken: any;
    socialType: SocialType.GOOGLE;
    googleEmail: string;
  }> {
    let redirectUri = this.getRedirectOrigin();
    redirectUri += '/login/google/redirect';

    const queryParam = {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: authenCode,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }

    let url = GOOGLE_TOKEN_ENDPOINT;
    url += '?' + new URLSearchParams(queryParam).toString();

    let tokenInfos;
    try {
      const response = await fetch(url, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const json = await response.json();
      //console.log('google getTokenApi respond: ', json);

      let accessToken = json.access_token;
      let expireAtMS = Number(json.expires_in) * 1000 + Date.now();
      let refreshToken = json.refresh_token;
      if (!refreshToken) {
        console.warn('no refreshToken despise access_type was set to offline before getting authen code');
      }
      let scope = json.scope;
      let tokenType = json.token_type;
      let socialType = SocialType.GOOGLE;
      tokenInfos = {
        accessToken,
        expireAtMS,
        refreshToken,
        scope,
        tokenType,
        socialType,
      }
    } catch (err) {
      let error = err as Error;
      console.warn('Something went wrong trying to get gg access token: ' + error.message);
      throw error;
    }

    if (tokenInfos?.accessToken) {
      let userInfo = await this._getUserInfo(tokenInfos?.accessToken);
      tokenInfos = {
        ...tokenInfos,
        ...userInfo,
      }
    }
    return tokenInfos;
  }

  private static async _getUserInfo(googleAccessToken: string): Promise<{
    gender?: string;
    name?: string;
    link?: string;
    id?: string;
    givenName?: string;
    locale?: string;
    familyName?: string;
    googleEmail?: string;
    picture?: string
  }> {

    try {
      const response = await fetch(GET_USER_INFO_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${googleAccessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`getUserInfo response status: ${response.status}`);
      }

      const json = await response.json();

      let id = json.id;
      let name = json.name;
      let googleEmail = json.email;
      let givenName = json.given_name;
      let familyName = json.family_name;
      let link = json.link;
      let picture = json.picture;
      let gender = json.gender;
      let locale = json.locale;

      return {
        id,
        name,
        googleEmail,
        givenName,
        familyName,
        link,
        picture,
        gender,
        locale,
      }

    } catch (err) {
      let error = err as Error;
      console.warn('Something went wrong trying to get gg access token: ' + error.message);
      throw error;
    }
  }

  static async refreshToken(refreshToken: string): Promise<{
    accessToken: any;
    scope: any;
    tokenType: any;
    expireAtMS: any;
    refreshToken: any;
    socialType: SocialType.GOOGLE;
  } | undefined> {

    const queryParam = {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }

    let url = GOOGLE_TOKEN_ENDPOINT;
    url += '?' + new URLSearchParams(queryParam).toString();

    let tokenInfos;
    try {
      const response = await fetch(url, {
        method: 'POST',
      });
      if (!response.ok) {
        console.warn('Refresh token failure', response);
        return undefined;
      }

      const json = await response.json();
      //console.log('google getTokenApi respond: ', json);

      let accessToken = json.access_token;
      let expireAtMS = Number(json.expires_in) * 1000 + Date.now();
      let scope = json.scope;
      let tokenType = json.token_type;
      let socialType = SocialType.GOOGLE;
      tokenInfos = {
        accessToken,
        expireAtMS,
        refreshToken,
        scope,
        tokenType,
        socialType,
      }
    } catch (err) {
      let error = err as Error;
      console.warn('WARN in refreshToken: ' + error.message);
      throw error;
    }
    console.log('refresh token success');
    return tokenInfos;
  }

  private static getRedirectOrigin() {
    let redirectOrigin;
    let reactAppMode = (AppConfig.get('APP_MODE') as string)?.trim()
    switch (reactAppMode) {
      case "DEV":
        redirectOrigin = AppConfig.get('APP_DEV_PUBLIC_URL') || '';
        break;
      case "DEV_PRE_BUILD":
        redirectOrigin = AppConfig.get('APP_DEV_PRE_BUILD_PUBLIC_URL') || '';
        break;
      case "LIVE":
        redirectOrigin = AppConfig.get('APP_LIVE_PUBLIC_URL') || '';
        break;
      default:
        console.error('Unknown VITE_APP_MODE', reactAppMode);
        throw new Error();
    }
    return redirectOrigin as string;
  }
}
