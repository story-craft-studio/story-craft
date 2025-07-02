export abstract class ServerHandler {
	protected constructor() {
	}
}

export class ServerEmptyHandler extends ServerHandler {
	constructor() {
		super();
	}
}
