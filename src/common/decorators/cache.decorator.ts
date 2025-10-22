import { SetMetadata } from '@nestjs/common';
import { CacheOptions } from '../interfaces';
import { CACHE_KEY } from '../constants';

export const Cache = (options: CacheOptions) => SetMetadata(CACHE_KEY, options);
