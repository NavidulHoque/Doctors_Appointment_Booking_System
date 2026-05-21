import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1700000000000 implements MigrationInterface {
  name = 'InitialMigration1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ------------------------------------------------------------------ User
    await queryRunner.query(`
      CREATE TABLE "User" (
        "id"           UUID          NOT NULL,
        "fullName"     VARCHAR       NOT NULL,
        "role"         VARCHAR       NOT NULL DEFAULT 'patient',
        "phone"        VARCHAR,
        "gender"       VARCHAR,
        "birthDate"    TIMESTAMP,
        "address"      VARCHAR,
        "avatarImage"  VARCHAR       NOT NULL DEFAULT '',
        "isOnline"     BOOLEAN       NOT NULL DEFAULT false,
        "lastActiveAt" TIMESTAMP,
        "createdAt"    TIMESTAMP     NOT NULL DEFAULT now(),
        "updatedAt"    TIMESTAMP     NOT NULL DEFAULT now(),
        "deletedAt"    TIMESTAMP,
        CONSTRAINT "PK_user__id" PRIMARY KEY ("id")
      )
    `);

    // ------------------------------------------------------------------ Doctor
    await queryRunner.query(`
      CREATE TABLE "Doctor" (
        "userId"                UUID    NOT NULL,
        "specialization"        VARCHAR NOT NULL,
        "education"             VARCHAR NOT NULL,
        "experience"            INT     NOT NULL,
        "aboutMe"               VARCHAR NOT NULL,
        "fees"                  INT     NOT NULL,
        "revenue"               INT     NOT NULL DEFAULT 0,
        "stripeAccountId"       VARCHAR UNIQUE,
        "isStripeAccountActive" BOOLEAN NOT NULL DEFAULT false,
        "createdAt"             TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"             TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt"             TIMESTAMP,
        CONSTRAINT "PK_doctor__userId" PRIMARY KEY ("userId"),
        CONSTRAINT "FK_doctor__userId"
          FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_doctor__specialization" ON "Doctor" ("specialization")`);
    await queryRunner.query(`CREATE INDEX "idx_doctor_experience"       ON "Doctor" ("experience")`);
    await queryRunner.query(`CREATE INDEX "idx_doctor_fees"             ON "Doctor" ("fees")`);

    // ------------------------------------------------------------------ DoctorWorkingDay
    await queryRunner.query(`
      CREATE TYPE "doctor_working_day_day_enum" AS ENUM (
        'sunday','monday','tuesday','wednesday','thursday','friday','saturday'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "DoctorWorkingDay" (
        "id"        UUID      NOT NULL DEFAULT uuid_generate_v4(),
        "doctorId"  UUID      NOT NULL,
        "day"       "doctor_working_day_day_enum" NOT NULL,
        "startTime" VARCHAR   NOT NULL,
        "endTime"   VARCHAR   NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_doctor_working_day__id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_doctor_working_day_doctorId_day" UNIQUE ("doctorId", "day"),
        CONSTRAINT "FK_doctor_working_day_doctorId"
          FOREIGN KEY ("doctorId") REFERENCES "Doctor"("userId") ON DELETE CASCADE
      )
    `);

    // ------------------------------------------------------------------ DoctorBreakTime
    await queryRunner.query(`
      CREATE TABLE "DoctorBreakTime" (
        "workingDayId" UUID      NOT NULL,
        "startTime"    VARCHAR   NOT NULL,
        "endTime"      VARCHAR   NOT NULL,
        "createdAt"    TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"    TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt"    TIMESTAMP,
        CONSTRAINT "PK_doctor_break_time__workingDayId" PRIMARY KEY ("workingDayId"),
        CONSTRAINT "FK_doctor_break_time_working_dayId"
          FOREIGN KEY ("workingDayId") REFERENCES "DoctorWorkingDay"("id") ON DELETE CASCADE
      )
    `);

    // ------------------------------------------------------------------ Appointment
    await queryRunner.query(`
      CREATE TABLE "Appointment" (
        "id"                 UUID      NOT NULL DEFAULT uuid_generate_v4(),
        "patientId"          UUID      NOT NULL,
        "doctorId"           UUID      NOT NULL,
        "date"               TIMESTAMP NOT NULL,
        "status"             VARCHAR   NOT NULL DEFAULT 'pending',
        "cancellationReason" VARCHAR   NOT NULL DEFAULT '',
        "isPaid"             BOOLEAN   NOT NULL DEFAULT false,
        "paymentMethod"      VARCHAR,
        "createdAt"          TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"          TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt"          TIMESTAMP,
        CONSTRAINT "PK_appointment__id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_appointment__patientId_date" UNIQUE ("patientId", "date"),
        CONSTRAINT "UQ_appointment__doctorId_date"  UNIQUE ("doctorId",  "date"),
        CONSTRAINT "FK_appointment__patientId"
          FOREIGN KEY ("patientId") REFERENCES "User"("id"),
        CONSTRAINT "FK_appointment__doctorId"
          FOREIGN KEY ("doctorId")  REFERENCES "User"("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_appointment__patientId" ON "Appointment" ("patientId")`);
    await queryRunner.query(`CREATE INDEX "idx_appointment__doctorId"  ON "Appointment" ("doctorId")`);

    // ------------------------------------------------------------------ Message
    await queryRunner.query(`
      CREATE TABLE "Message" (
        "id"         UUID      NOT NULL DEFAULT uuid_generate_v4(),
        "content"    VARCHAR   NOT NULL,
        "senderId"   UUID      NOT NULL,
        "receiverId" UUID      NOT NULL,
        "createdAt"  TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"  TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt"  TIMESTAMP,
        CONSTRAINT "PK_message__id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_message__senderId"
          FOREIGN KEY ("senderId")   REFERENCES "User"("id"),
        CONSTRAINT "FK_message__receiverId"
          FOREIGN KEY ("receiverId") REFERENCES "User"("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_message__senderId"   ON "Message" ("senderId")`);
    await queryRunner.query(`CREATE INDEX "idx_message__receiverId" ON "Message" ("receiverId")`);

    // ------------------------------------------------------------------ Notification
    await queryRunner.query(`
      CREATE TABLE "Notification" (
        "id"        UUID      NOT NULL DEFAULT uuid_generate_v4(),
        "content"   VARCHAR   NOT NULL,
        "userId"    UUID      NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_notification__id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_notification__userId"
          FOREIGN KEY ("userId") REFERENCES "User"("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_notification__userId" ON "Notification" ("userId")`);

    // ------------------------------------------------------------------ Payment
    await queryRunner.query(`
      CREATE TABLE "Payment" (
        "id"            UUID      NOT NULL DEFAULT uuid_generate_v4(),
        "userId"        UUID      NOT NULL,
        "appointmentId" UUID      NOT NULL UNIQUE,
        "amount"        FLOAT     NOT NULL,
        "transactionId" VARCHAR   NOT NULL UNIQUE,
        "status"        VARCHAR   NOT NULL DEFAULT 'pending',
        "createdAt"     TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"     TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt"     TIMESTAMP,
        CONSTRAINT "PK_payment__id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_payment__userId"
          FOREIGN KEY ("userId")        REFERENCES "User"("id"),
        CONSTRAINT "FK_payment__appointmentId"
          FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_payment__userId" ON "Payment" ("userId")`);

    // ------------------------------------------------------------------ Review
    await queryRunner.query(`
      CREATE TABLE "Review" (
        "id"        UUID      NOT NULL DEFAULT uuid_generate_v4(),
        "patientId" UUID      NOT NULL,
        "doctorId"  UUID      NOT NULL,
        "comment"   VARCHAR,
        "rating"    INT       NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_review__id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_review__patientId"
          FOREIGN KEY ("patientId") REFERENCES "User"("id"),
        CONSTRAINT "FK_review__doctorId"
          FOREIGN KEY ("doctorId")  REFERENCES "User"("id")
      )
    `);

    await queryRunner.query(`CREATE INDEX "idx_review__patientId" ON "Review" ("patientId")`);
    await queryRunner.query(`CREATE INDEX "idx_review__doctorId"  ON "Review" ("doctorId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop in reverse dependency order
    await queryRunner.query(`DROP INDEX "idx_review__doctorId"`);
    await queryRunner.query(`DROP INDEX "idx_review__patientId"`);
    await queryRunner.query(`DROP TABLE "Review"`);

    await queryRunner.query(`DROP INDEX "idx_payment__userId"`);
    await queryRunner.query(`DROP TABLE "Payment"`);

    await queryRunner.query(`DROP INDEX "idx_notification__userId"`);
    await queryRunner.query(`DROP TABLE "Notification"`);

    await queryRunner.query(`DROP INDEX "idx_message__receiverId"`);
    await queryRunner.query(`DROP INDEX "idx_message__senderId"`);
    await queryRunner.query(`DROP TABLE "Message"`);

    await queryRunner.query(`DROP INDEX "idx_appointment__doctorId"`);
    await queryRunner.query(`DROP INDEX "idx_appointment__patientId"`);
    await queryRunner.query(`DROP TABLE "Appointment"`);

    await queryRunner.query(`DROP TABLE "DoctorBreakTime"`);

    await queryRunner.query(`DROP TABLE "DoctorWorkingDay"`);
    await queryRunner.query(`DROP TYPE "doctor_working_day_day_enum"`);

    await queryRunner.query(`DROP INDEX "idx_doctor_fees"`);
    await queryRunner.query(`DROP INDEX "idx_doctor_experience"`);
    await queryRunner.query(`DROP INDEX "idx_doctor__specialization"`);
    await queryRunner.query(`DROP TABLE "Doctor"`);

    await queryRunner.query(`DROP TABLE "User"`);
  }
}