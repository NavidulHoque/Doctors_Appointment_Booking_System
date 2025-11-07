import { SetMetadata } from '@nestjs/common';
import { CACHE_KEY } from 'src/common/constants';
import { CacheOptions } from 'src/common/interfaces';

export const Cache = (options: CacheOptions) => SetMetadata(CACHE_KEY, options);
