import { PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { BaseTimestampEntity } from './base-timestamp.entity';

export abstract class BaseGeneratedUUIDEntity extends BaseTimestampEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
}

export abstract class BaseUUIDEntity extends BaseTimestampEntity {
  @PrimaryColumn('uuid')
  id: string;
}