export type AppConfigType = {
	PUBLIC_URL_SHORT: string;
	PUBLIC_URL: string;
	APP_MODE: string;
	APP_DEV_PUBLIC_URL: string;
	APP_DEV_PRE_BUILD_PUBLIC_URL: string;
	APP_LIVE_PUBLIC_URL: string;
	APP_DEV_SERVER_URL: string;
	APP_DEV_PRE_BUILD_SERVER_URL: string;
	APP_LIVE_SERVER_URL: string;
	STUDIO_DEV_URL: string;
	// Google OAuth Configuration
	GOOGLE_CLIENT_ID: string;
	GOOGLE_CLIENT_SECRET: string;
	// Asset Server Configuration  
	ASSET_SERVER_BASE_URL: string;
}

// === IMPORTANCE: DO NOT REMOVE ME
const DEV = 'DEV';
const LIVE = 'LIVE';
// ===

console.log(process.env);

export default class AppConfig {
	private static _config: AppConfigType;

	static {
		this._config = {
			PUBLIC_URL_SHORT: process.env.PUBLIC_URL_SHORT!,
			PUBLIC_URL: process.env.PUBLIC_URL!,

			//modes include: ['DEV', 'LIVE', 'DEV_PRE_BUILD'],
			APP_MODE: process.env.BUILD_MODE || DEV,

			APP_DEV_PUBLIC_URL: process.env.APP_DEV_PUBLIC_URL!,
			APP_DEV_PRE_BUILD_PUBLIC_URL: process.env.APP_DEV_PRE_BUILD_PUBLIC_URL!,
			APP_LIVE_PUBLIC_URL: window.location.origin,

			APP_DEV_SERVER_URL: process.env.APP_DEV_SERVER_URL!,
			APP_DEV_PRE_BUILD_SERVER_URL: process.env.APP_DEV_PRE_BUILD_SERVER_URL!,
			APP_LIVE_SERVER_URL: window.location.origin,

			STUDIO_DEV_URL: process.env.STUDIO_DEV_URL!,

			// Google OAuth Configuration - moved from hardcoded values for security
			GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
			GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',

			// Asset Server Configuration - moved from hardcoded URLs for security
			ASSET_SERVER_BASE_URL: process.env.ASSET_SERVER_BASE_URL || '',
		};
	}

	static get(configKey: keyof AppConfigType): string {
		return this._config[configKey] + '';
	}

	static isDev() {
		return AppConfig.get('APP_MODE')?.trim().toLowerCase() !== 'live'
	}
}
