import {
  PipeTransform,
  Injectable,
  NotFoundException,
  Type,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

type PrimaryKeys = {
  [key: string]: string;
};

const PRIMARY_KEYS: PrimaryKeys = {
  doctor: 'userId',
  user: 'id',
  appointment: 'id',
  review: 'id',
  message: 'id',
  notification: 'id',
  payment: 'id',
  session: 'id',
};

export function EntityByIdPipe(
  modelName: keyof PrismaService,
  select: any | null = null,
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
