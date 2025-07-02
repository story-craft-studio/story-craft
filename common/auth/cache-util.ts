export class CacheUtil {
  private static cacheList: Map<string, Cache<any>> = new Map();

  static create<T>(cacheName: string): Cache<T> {
    let found = this.cacheList.get(cacheName);
    if (!found) {
      found = new Cache<T>();
      this.cacheList.set(cacheName, found);
    }
    return found;
  }

}

export class Cache<T> {
  private _map: Map< string | number, T> = new Map();

  set(key: string | number, value: T) {
    this._map.set(key, value);
  }

  get(key: number): T | undefined {
    return this._map.get(key);
  }

  has(key: number) {
    return this._map.has(key);
  }
}
