import {
  PipeTransform,
  Injectable,
  NotFoundException,
  Type,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma';
import { PRIMARY_KEYS } from '../constants';

export function EntityByIdPipe(
  modelName: keyof PrismaService,
  select: Record<string, any> | null = null,
): Type<PipeTransform> {
  @Injectable()
  class MixinEntityByIdPipe implements PipeTransform {
    constructor(private readonly prisma: PrismaService) {}

    async transform(value: string) {
      const primaryKey = PRIMARY_KEYS[modelName as string];

      const entity = await (this.prisma[modelName] as any).findUnique({
        where: { [primaryKey]: value },
        select,
      });

      if (!entity) {
        throw new NotFoundException(
          `${String(modelName)} with ${primaryKey}=${value} not found`,
        );
      }

      return entity;
    }
  }

  return MixinEntityByIdPipe;
}