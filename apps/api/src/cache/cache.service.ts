import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Redis } from '@upstash/redis';

@Injectable()
export class CacheService implements OnModuleInit {
  private redis: Redis;
  private readonly logger = new Logger(CacheService.name);
  private enabled = true;

  onModuleInit() {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      this.logger.warn(
        'UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set — cache disabled',
      );
      this.enabled = false;
      return;
    }

    this.redis = new Redis({ url, token });
    this.logger.log('Upstash Redis cache connected');
  }

  /**
   * Get a cached value. Returns null on miss or if cache is disabled.
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.enabled) return null;
    try {
      const value = await this.redis.get<T>(key);
      if (value !== null && value !== undefined) {
        this.logger.debug(`Cache HIT: ${key}`);
      }
      return value ?? null;
    } catch (error) {
      this.logger.warn(`Cache GET error for key "${key}": ${error}`);
      return null;
    }
  }

  /**
   * Set a cached value with TTL in seconds (default: 60s).
   */
  async set(key: string, value: unknown, ttl = 60): Promise<void> {
    if (!this.enabled) return;
    try {
      await this.redis.set(key, JSON.stringify(value), { ex: ttl });
      this.logger.debug(`Cache SET: ${key} (TTL: ${ttl}s)`);
    } catch (error) {
      this.logger.warn(`Cache SET error for key "${key}": ${error}`);
    }
  }

  /**
   * Delete a specific key.
   */
  async del(key: string): Promise<void> {
    if (!this.enabled) return;
    try {
      await this.redis.del(key);
      this.logger.debug(`Cache DEL: ${key}`);
    } catch (error) {
      this.logger.warn(`Cache DEL error for key "${key}": ${error}`);
    }
  }

  /**
   * Delete all keys matching a pattern (e.g. "clients:user123:*").
   * Uses SCAN to avoid blocking.
   */
  async invalidatePattern(pattern: string): Promise<void> {
    if (!this.enabled) return;
    try {
      let cursor = 0;
      do {
        const result = await this.redis.scan(cursor, { match: pattern, count: 100 });
        cursor = result[0];
        const keys = result[1];
        if (keys.length > 0) {
          await this.redis.del(...keys);
          this.logger.debug(`Cache INVALIDATE: ${keys.length} keys matching "${pattern}"`);
        }
      } while (cursor !== 0);
    } catch (error) {
      this.logger.warn(`Cache INVALIDATE error for pattern "${pattern}": ${error}`);
    }
  }
}
