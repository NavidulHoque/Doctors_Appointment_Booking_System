# 🩺 Doctor Appointment Management System

A full-featured backend system for managing doctor appointments, payments and real-time messaging — built with **NestJS**, **Prisma**, and **PostgreSQL**.

## ⚙️ Features

- 🔔 Real-time notifications using **Redis + BullMQ + WebSocket**
- 💬 Real-time messaging between **Doctor, Patient, and Admin**
- 📡 Asynchronous message processing with **Kafka** for high throughput
- 🧾 Automated appointment status updates via **BullMQ**
- ⏰ Online activity tracking using **Cron Jobs**
- 🖼️ Avatar image uploads with **Multer + Cloudinary**
- 💳 Online payments via **Stripe Express Connect** (multi-vendor setup)
- 🔐 Role-based access: Doctor / Patient / Admin
- 🧪 Input validation using **NestJS decorators and pipes**

## 🛠️ Tech Stack

- **Backend:** NestJS, TypeScript
- **Database:** Prisma ORM + PostgreSQL
- **Queue:** Redis + BullMQ
- **Real-time:** WebSocket (Gateway)
- **Payments:** Stripe Express Connect
- **File Uploads:** Multer + Cloudinary
- **Containerization:** Docker

## 🐳 Dockerized Setup

This project uses Docker to spin up **PostgreSQL** and **Redis** containers for local development.

### 📦 Run Redis + PostgreSQL with Docker

```bash
docker-compose up
```

Make sure your .env file matches the credentials and ports defined in your docker-compose.yml.

## 🚀 How to Run Locally

```bash
git clone https://github.com/NavidulHoque/Doctors_Appointment_Booking_System.git
cd Doctors_Appointment_Booking_System
docker-compose up
npm install
npm run start:dev
```

⚠️ You'll need .env variables for DB, Redis, Stripe, Cloudinary, etc — not included here for security.
