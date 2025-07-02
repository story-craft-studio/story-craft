
export default class DelayTaskUtil {
	static delayTaskTracker: Map<string, any> = new Map();

	/**
	 * @deprecated Please use lodash.debounce instead
	 * Re-invoke a delay task
	 * @param registerId - The unique identifier for the delay task
	 * @param cb - The callback function to execute
	 * @param delaySecond - The delay time in seconds (default is 0.8)
	 */
	static reInvokeDelayTask(registerId: string, cb: Function, delaySecond: number = 0.8) {
		//console.log('reInvokeDelayTask ' + registerId);
		let registerBefore = this.delayTaskTracker.get(registerId);
		if (registerBefore) {
			clearTimeout(registerBefore);
		}

		let registerANew = setTimeout(cb, delaySecond * 1000);
		this.delayTaskTracker.set(registerId, registerANew);
	}

	static cancelDelayTask(registerId: string) {
		let registerBefore = this.delayTaskTracker.get(registerId);
		if (registerBefore) {
			clearTimeout(registerBefore);
			this.delayTaskTracker.delete(registerId);
		}
	}
}
