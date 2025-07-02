import EventEmitter from "eventemitter3";

export enum EventName {
  //#region editor
  //==========================
  mouseMoveStart='mouseMoveStart',
  mouseMoving='mouseMovving',
  mouseMoveEnd='mouseMoveEnd',
  passageNameChange = 'passageNameChange',
  passageCommandTypesChange='passageCommandTypesChange',
  tagChangeStart = 'tagChangeStart',
  tagChangeEnd = 'tagChangeEnd',
  tagRemoveStart = 'tagRemoveStart',
  tagRemoveEnd = 'tagRemoveEnd',
  //#endregion

  //#region asset
  //==========================
  assetChange='assetChange',
  characterChange='characterChange',
  //#endregion

  //#region Authen
  //==========================
  authLoggedIn = 'authLoggedIn',
  authLoggedOut = 'authLoggedOut',
  //#endregion

  //#region settings
  //==========================
  twineGameSettingsChangeIncoming='twineGameSettingsChangeIncoming',
  twineGameSettingsChangeApplied='twineGameSettingsChangeApplied',
  //#endregion

  //#region modal
  //==========================
  enableDemoModal= 'enableDemoModal',
  demoModalChangeCharacterIndex= 'demoModalChangeCharacterIndex',
  demoModalChangeSkinIndex= 'demoModalChangeSkinIndex',
  dialogSettingsMounted= 'dialogSettingsMounted',
  //#endregion

  APPLY_PRESET_SETTINGS = 'APPLY_PRESET_SETTINGS',
}

class _EvtMgr {
  private eventEmitter: EventEmitter;

  constructor() {
    this.eventEmitter = new EventEmitter();
  }

  once(eventName: EventName, cb: (...args: any[]) => void, bundledData?: any) {
    this.eventEmitter.once(eventName + '', cb, bundledData);
  }

  on(eventName: EventName, cb: (...args: any[]) => void) {
    this.eventEmitter.on(eventName + '', cb);
  }

  off(eventName: EventName, cb: (...args: any[]) => void) {
    this.eventEmitter.off(eventName + '', cb);
  }

  emit(eventName: EventName, bundledData?: any) {
    this.eventEmitter.emit(eventName + '', bundledData);
  }

}

const EvtMgr = new _EvtMgr();
export default EvtMgr;
