import { Injectable } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';
import { RedisService } from './redis.service';

@Injectable()
export class RedisThrottlerStorage implements ThrottlerStorage {
  constructor(private readonly redis: RedisService) { }

  async increment(
    key: string,
    ttl: number,
  ): Promise<{ totalHits: number; timeToExpire: number }> {
    const created = await this.redis.setNxPx(key, '1', ttl);
    if (created) {
      return {
        totalHits: 1,
        timeToExpire: ttl,
      };
    }

    const totalHits = Number(await this.redis.incr(key));
    let pttl = Number(await this.redis.pttl(key));

    if (pttl < 0) {
      await this.redis.pexpire(key, ttl);
      pttl = Number(await this.redis.pttl(key));
    }

    return {
      totalHits,
      timeToExpire: Math.max(pttl, 0),
    };
  }
}

