import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1777377757861 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "User" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "fullName" character varying NOT NULL,
                "email" character varying NOT NULL,
                "role" character varying NOT NULL DEFAULT 'PATIENT',
                "phone" character varying,
                "gender" character varying,
                "birthDate" TIMESTAMP,
                "address" character varying,
                "password" character varying NOT NULL,
                "avatarImage" character varying NOT NULL DEFAULT '',
                "isOnline" boolean NOT NULL DEFAULT false,
                "lastActiveAt" TIMESTAMP,
                "otp" character varying,
                "otpExpires" TIMESTAMP,
                "isOtpVerified" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_user__id" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_user__email" UNIQUE ("email")
            )
        `);
        await queryRunner.query(`CREATE INDEX "idx_user__email" ON "User" ("email")`);

        await queryRunner.query(`
            CREATE TABLE "Session" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                "deviceName" character varying,
                "refreshToken" character varying NOT NULL,
                "expiresAt" TIMESTAMP NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_session__id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`CREATE INDEX "idx_session__userId" ON "Session" ("userId")`);

        await queryRunner.query(`
            CREATE TABLE "Doctor" (
                "userId" uuid NOT NULL,
                "specialization" character varying NOT NULL,
                "education" character varying NOT NULL,
                "experience" integer NOT NULL,
                "aboutMe" character varying NOT NULL,
                "fees" integer NOT NULL,
                "revenue" integer NOT NULL DEFAULT 0,
                "availableTimes" text array NOT NULL,
                "isActive" boolean NOT NULL DEFAULT false,
                "stripeAccountId" character varying,
                "isStripeAccountActive" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_doctor__userId" PRIMARY KEY ("userId"),
                CONSTRAINT "UQ_doctor__stripeAccountId" UNIQUE ("stripeAccountId")
            )
        `);
        await queryRunner.query(`CREATE INDEX "idx_doctor__specialization" ON "Doctor" ("specialization")`);

        await queryRunner.query(`
            CREATE TABLE "Appointment" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "patientId" uuid NOT NULL,
                "doctorId" uuid NOT NULL,
                "date" TIMESTAMP NOT NULL,
                "status" character varying NOT NULL DEFAULT 'PENDING',
                "cancellationReason" character varying NOT NULL DEFAULT '',
                "isPaid" boolean NOT NULL DEFAULT false,
                "paymentMethod" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_appointment__id" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_appointment__patientId_date" UNIQUE ("patientId", "date"),
                CONSTRAINT "UQ_appointment__doctorId_date" UNIQUE ("doctorId", "date")
            )
        `);
        await queryRunner.query(`CREATE INDEX "idx_appointment__patientId" ON "Appointment" ("patientId")`);
        await queryRunner.query(`CREATE INDEX "idx_appointment__doctorId" ON "Appointment" ("doctorId")`);

        await queryRunner.query(`
            CREATE TABLE "Payment" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                "appointmentId" uuid NOT NULL,
                "amount" double precision NOT NULL,
                "transactionId" character varying NOT NULL,
                "status" character varying NOT NULL DEFAULT 'PENDING',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_payment__id" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_payment__appointmentId" UNIQUE ("appointmentId"),
                CONSTRAINT "UQ_payment__transactionId" UNIQUE ("transactionId")
            )
        `);
        await queryRunner.query(`CREATE INDEX "idx_payment__userId" ON "Payment" ("userId")`);

        await queryRunner.query(`
            CREATE TABLE "Message" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "content" character varying NOT NULL,
                "senderId" uuid NOT NULL,
                "receiverId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_message__id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`CREATE INDEX "idx_message__senderId" ON "Message" ("senderId")`);
        await queryRunner.query(`CREATE INDEX "idx_message__receiverId" ON "Message" ("receiverId")`);

        await queryRunner.query(`
            CREATE TABLE "Notification" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "content" character varying NOT NULL,
                "userId" uuid NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_notification__id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`CREATE INDEX "idx_notification__userId" ON "Notification" ("userId")`);

        await queryRunner.query(`
            CREATE TABLE "Review" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "patientId" uuid NOT NULL,
                "doctorId" uuid NOT NULL,
                "comment" character varying,
                "rating" integer NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_review__id" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`CREATE INDEX "idx_review__patientId" ON "Review" ("patientId")`);
        await queryRunner.query(`CREATE INDEX "idx_review__doctorId" ON "Review" ("doctorId")`);

        // Foreign keys
        await queryRunner.query(`ALTER TABLE "Session" ADD CONSTRAINT "FK_session__userId" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "Doctor" ADD CONSTRAINT "FK_doctor__userId" FOREIGN KEY ("userId") REFERENCES "User"("id")`);
        await queryRunner.query(`ALTER TABLE "Appointment" ADD CONSTRAINT "FK_appointment__patientId" FOREIGN KEY ("patientId") REFERENCES "User"("id")`);
        await queryRunner.query(`ALTER TABLE "Appointment" ADD CONSTRAINT "FK_appointment__doctorId" FOREIGN KEY ("doctorId") REFERENCES "User"("id")`);
        await queryRunner.query(`ALTER TABLE "Payment" ADD CONSTRAINT "FK_payment__userId" FOREIGN KEY ("userId") REFERENCES "User"("id")`);
        await queryRunner.query(`ALTER TABLE "Payment" ADD CONSTRAINT "FK_payment__appointmentId" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id")`);
        await queryRunner.query(`ALTER TABLE "Message" ADD CONSTRAINT "FK_message__senderId" FOREIGN KEY ("senderId") REFERENCES "User"("id")`);
        await queryRunner.query(`ALTER TABLE "Message" ADD CONSTRAINT "FK_message__receiverId" FOREIGN KEY ("receiverId") REFERENCES "User"("id")`);
        await queryRunner.query(`ALTER TABLE "Notification" ADD CONSTRAINT "FK_notification__userId" FOREIGN KEY ("userId") REFERENCES "User"("id")`);
        await queryRunner.query(`ALTER TABLE "Review" ADD CONSTRAINT "FK_review__patientId" FOREIGN KEY ("patientId") REFERENCES "User"("id")`);
        await queryRunner.query(`ALTER TABLE "Review" ADD CONSTRAINT "FK_review__doctorId" FOREIGN KEY ("doctorId") REFERENCES "User"("id")`);
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Review" DROP CONSTRAINT "FK_review__doctorId"`);
        await queryRunner.query(`ALTER TABLE "Review" DROP CONSTRAINT "FK_review__patientId"`);
        await queryRunner.query(`ALTER TABLE "Notification" DROP CONSTRAINT "FK_notification__userId"`);
        await queryRunner.query(`ALTER TABLE "Message" DROP CONSTRAINT "FK_message__receiverId"`);
        await queryRunner.query(`ALTER TABLE "Message" DROP CONSTRAINT "FK_message__senderId"`);
        await queryRunner.query(`ALTER TABLE "Payment" DROP CONSTRAINT "FK_payment__appointmentId"`);
        await queryRunner.query(`ALTER TABLE "Payment" DROP CONSTRAINT "FK_payment__userId"`);
        await queryRunner.query(`ALTER TABLE "Appointment" DROP CONSTRAINT "FK_appointment__doctorId"`);
        await queryRunner.query(`ALTER TABLE "Appointment" DROP CONSTRAINT "FK_appointment__patientId"`);
        await queryRunner.query(`ALTER TABLE "Doctor" DROP CONSTRAINT "FK_doctor__userId"`);
        await queryRunner.query(`ALTER TABLE "Session" DROP CONSTRAINT "FK_session__userId"`);

        await queryRunner.query(`DROP TABLE "Review"`);
        await queryRunner.query(`DROP TABLE "Notification"`);
        await queryRunner.query(`DROP TABLE "Message"`);
        await queryRunner.query(`DROP TABLE "Payment"`);
        await queryRunner.query(`DROP TABLE "Appointment"`);
        await queryRunner.query(`DROP TABLE "Doctor"`);
        await queryRunner.query(`DROP TABLE "Session"`);
        await queryRunner.query(`DROP TABLE "User"`);
    }
}
