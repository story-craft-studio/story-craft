import { ServerEmptyHandler } from "./server-handler";
import { ServerStaticAsset } from "./server-static-asset";

export default class Network {
	private static mapServerEnumWithServerHandler = new Map();

	private static serverEmptyHandler: ServerEmptyHandler = new ServerEmptyHandler();

	private static internetAvailability: InternetAvailability | null;

	static {
		Network.mapServerEnumWithServerHandler.set(ServerStaticAsset, new ServerStaticAsset());
	}


	static withServerStaticAsset(): ServerStaticAsset {
		return Network.mapServerEnumWithServerHandler.get(ServerStaticAsset);
	}

}

export type InternetAvailability = {
	available: boolean,
	hostUrl?: string,
	err?: any,
}
