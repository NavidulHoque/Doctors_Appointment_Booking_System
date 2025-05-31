# 🩺 Doctor Appointment Management System

A full-featured backend system for managing doctor appointments, payments and real-time messaging built with NestJS, Prisma, and PostgreSQL.

## ⚙️ Features

- 🔔 Real-time notifications using **Redis + BullMQ + WebSocket**
- 💬 Real-time messaging between **Doctor, Patient, Admin**
- 🧾 Automated appointment status updates via **BullMQ**
- ⏰ Online activity tracking with **Cron Jobs**
- 🖼️ Avatar uploads with **Multer + Cloudinary**
- 💳 Stripe Express Connect integration for **doctor payouts**
- 🔐 Role-based access: Doctor / Patient / Admin
- 🧪 Validation using NestJS decorators and pipes

## 🛠️ Tech Stack

- NestJS
- Prisma + PostgreSQL
- Redis + BullMQ
- Stripe Connect
- WebSocket
- Cloudinary + Multer

## 🚀 How to Run Locally

```bash
git clone https://github.com/NavidulHoque/Doctors_Appointment_Booking_System.git
cd Doctors_Appointment_Booking_System
npm install
npm run start:dev
```

You'll need .env variables for DB, Redis, Stripe, Cloudinary etc — not included here for security.
