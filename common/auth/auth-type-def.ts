import {LoginType} from "../network-handler/server-static-asset";


export type LoggedInUser = {
  zpsUsername?: string;
  zpsUserAvatar?: string;
  zpsUserId?: number;
  id?: number;
  name?: string;
  avatar?: string;
  socialType?: string;
  expireAtMS?: number;

  googleEmail?: string;
  accessToken?: any;
  scope?: any;
  tokenType?: any;
  refreshToken?: any;
  zpsToken?: string;


  loginType: LoginType;
  //#region guest login support
  //==========================
  guestToken?: string;
  //#endregion
}
