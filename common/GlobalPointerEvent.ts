import EvtMgr, {EventName} from "./evt-mgr";
import DelayTaskUtil from "../util/DelayTaskUtil";

export default class GlobalPointerEvent {
	static _isMoving = false;
	static onMoveTo(x: number, y: number) {
		if (!this._isMoving) {
			EvtMgr.emit(EventName.mouseMoveStart, {x, y});
			this._isMoving = true;
		}

		EvtMgr.emit(EventName.mouseMoving, {x, y});

		DelayTaskUtil.reInvokeDelayTask('GlobalPointerEvent-mouseMove', () => {
			this._isMoving = false;
			EvtMgr.emit(EventName.mouseMoveEnd, {x, y});
		}, 0.25);
	}
}
