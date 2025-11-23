import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
} from 'typeorm'

export abstract class AppBaseEntity extends BaseEntity {
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date

  @Column({ name: 'created_by', nullable: true })
  createdBy: string

  @Column({ name: 'updated_by', default: null })
  updatedBy: string

  @Column({ name: 'deleted_by', default: null })
  deletedBy: string
}