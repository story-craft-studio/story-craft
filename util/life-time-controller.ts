
type TimeoutRecords = {
	start: number,
	timeout: number,
	cb: () => void,
	_timeOutInstance: NodeJS.Timeout,
}

export default class LifeTimeController {
	private _timeoutRecords: TimeoutRecords[] = []
	private constructor() {
	}

	/**
	 *
	 * @param sec {number} seconds
	 */
	after(sec: number) {
		let start = Date.now();
		return {
			execute: (cb: () => void) => {
				let _timeOutInstance = setTimeout(() => {
					cb();
				}, sec * 1000);

				this._timeoutRecords.push({
					start,
					timeout: sec * 1000,
					cb,
					_timeOutInstance
				});

				return this;
			}
		}
	}

	static create() {
		let c = new LifeTimeController();
		return c;
	}

	deleteAllCbs() {
		this._timeoutRecords.forEach(each => {
			clearTimeout(each._timeOutInstance);
		});
		this._timeoutRecords = [];
	}
}
