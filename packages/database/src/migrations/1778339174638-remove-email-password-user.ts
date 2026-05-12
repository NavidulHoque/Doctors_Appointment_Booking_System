import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveEmailPasswordUser1778339174638 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_user__email"`);
        await queryRunner.query(`ALTER TABLE "User" DROP CONSTRAINT "UQ_user__email"`);
        await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "password"`);
        await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "otp"`);
        await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "otpExpires"`);
        await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "isOtpVerified"`);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "idx_user__email" ON "User" ("email") `);
        await queryRunner.query(`ALTER TABLE "User" ADD CONSTRAINT "UQ_user__email" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "User" ADD "email" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "User" ADD "password" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "User" ADD "otp" character varying`);
        await queryRunner.query(`ALTER TABLE "User" ADD "otpExpires" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "User" ADD "isOtpVerified" boolean NOT NULL DEFAULT false`);
    }
}
