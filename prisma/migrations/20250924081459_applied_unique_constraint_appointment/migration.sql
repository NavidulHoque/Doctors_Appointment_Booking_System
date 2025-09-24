/*
  Warnings:

  - A unique constraint covering the columns `[doctorId,date]` on the table `Appointment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[patientId,date]` on the table `Appointment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Appointment_doctorId_date_key" ON "public"."Appointment"("doctorId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_patientId_date_key" ON "public"."Appointment"("patientId", "date");
