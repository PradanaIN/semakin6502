import { Inject, Injectable } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";

@Injectable()
export class MonitoringCacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache?: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    return (await this.cache?.get<T>(key)) || undefined;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await this.cache?.set(key, value, ttlSeconds);
  }

  async wrap<T>(
    key: string,
    ttlSeconds: number,
    factory: () => Promise<T>,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== undefined) return cached;
    const value = await factory();
    await this.set(key, value, ttlSeconds);
    return value;
  }
}
