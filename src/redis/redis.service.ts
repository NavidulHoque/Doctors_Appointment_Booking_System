import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { Redis as RedisClient } from 'ioredis';
import { AppConfigService } from 'src/config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  private client: RedisClient;

  constructor(private readonly config: AppConfigService) {}

  async onModuleInit() {
    this.client = new Redis({
      host: this.config.redis.host,
      port: this.config.redis.port,
      db: this.config.redis.db,
      lazyConnect: true,
    });

    this.client.on('connect', () => {
      this.logger.log(`Redis Connected to ${this.config.redis.host}:${this.config.redis.port}`);
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis error:', err.message);
    });

    await this.client.connect()
  }

  async onModuleDestroy() {
    if (this.client) {
      try {
        await this.client.quit();
        console.log('Redis Connection closed gracefully');
      } catch {
        this.client.disconnect();
      }
    }
  }

  async get(key: string) {
    return await this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number) {
    if (ttlSeconds) {
      return await this.client.set(key, value, 'EX', ttlSeconds);
    }
    return await this.client.set(key, value);
  }

  async del(key: string) {
    return await this.client.del(key);
  }

  async delByPattern(pattern: string) {
    // Find all keys matching the pattern
    const keys = await this.client.keys(pattern);

    // If there are matching keys, delete them all at once
    if (keys.length) {
      await this.client.del(...keys);
    }
  }

  getClient(): RedisClient {
    return this.client;
  }

  async incr(key: string) {
    return this.client.incr(key);
  }

  async pttl(key: string) {
    return this.client.pttl(key);
  }

  async setNxPx(key: string, value: string, ttlMs: number) {
    const res = await this.client.set(key, value, 'PX', ttlMs, 'NX');
    return res === 'OK';
  }

  async pexpire(key: string, ttlMs: number) {
    return this.client.pexpire(key, ttlMs);
  }
}
