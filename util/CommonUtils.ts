export default class CommonUtils {
	static async sleep(ms: number) {
		return new Promise((res, rej) => {
			setTimeout(() => {
				res(ms);
			}, ms);
		})
	}

    static abc(val: unknown) {
	}
}
