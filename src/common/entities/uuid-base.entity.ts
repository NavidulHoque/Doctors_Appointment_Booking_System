import { PrimaryGeneratedColumn } from 'typeorm'

import { AppBaseEntity } from './base.entity'

export abstract class UuidBaseEntity extends AppBaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string
}