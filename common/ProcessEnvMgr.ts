import AppConfig from "../app-config";


class _ProcessEnvMgr {
  get(key: string): string {
    return process.env[key] || '';
  }

  useGGLogin () {
    return false;
  }

  get mode () {
    return AppConfig.get('APP_MODE')?.trim();
  }

  useFBLogin() {
    return false;
  }

  useAppleLogin() {
    return false;
  }
}

const processEnvMgr = new _ProcessEnvMgr();
export default processEnvMgr;
