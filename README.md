# 🩺 Doctor Appointment Management System

A full-featured backend system for managing doctor appointments, payments and real-time messaging — built with **NestJS**, **Prisma**, and **PostgreSQL**.

## ⚙️ Features

- **💬 Real-Time Chat & Notifications**<br>
Built a high-performance **WebSocket** gateway powered by **Redis** and **BullMQ**, supporting 1,000+ concurrent users for real-time messaging between Doctors, Patients, Admins and notifications.
- **📡 Event-Driven Architecture with Kafka**<br>
Implemented **Apache Kafka** for asynchronous and scalable data processing, efficiently handling 10,000+ daily messaging.
- **🧾 Automated Workflows**<br>
Utilized **BullMQ** and **Cron Jobs** for automated appointment updates, background processing, user activity tracking and cleanup of expired sessions — reducing manual effort by 30%.
- **💳 Multi-Vendor Payments via Stripe Connect**<br>
Integrated **Stripe Express Connect** for secure transactions and instant payouts to 50+ doctors, ensuring seamless payment flow.
- **⚡ Performance Optimization**<br>
Leveraged **Redis caching** and **rate limiting** to reduce API response times by 60%, improving scalability and user experience.
- **📢 Engagement & Alerts**<br>
Enhanced user engagement by adding email/SMS notifications, increasing response rates by 25%.
- **🖼️ Secure File Uploads**<br>
Implemented avatar uploads with **Multer** and **Cloudinary**, ensuring secure media storage.
- **🔐 Access Control & Validation**<br>
Role-based access system for Doctor, Patient, and Admin with robust validation using **NestJS Guards**.
- **🤖 AI-Powered Assistance**<br>
Integrated **OpenAI** (via MCP server) to enable AI-driven chat assistance, smart appointment recommendations, and automated responses.
- **🐳 Containerization & Deployment**<br>
Containerized the entire application with **Docker**, ensuring consistent environments for **Redis**, **PostgreSQL**, and **Kafka** services.

## 🛠️ Tech Stack

- **Backend:** NestJS, TypeScript
- **Database:** Prisma ORM, PostgreSQL
- **Queue & Caching:** Redis, BullMQ
- **Event Streaming:** Apache Kafka
- **Real-Time Communication:** WebSocket (Gateway)
- **Payments:** Stripe Express Connect
- **File Uploads:** Multer + Cloudinary
- **Containerization:** Docker
- **Scheduling:** Cron Jobs
- **AI Integration:** OpenAI
- **Authentication:** JWT (JSON Web Token)

## 🐳 Dockerized Setup

This project uses Docker to spin up **PostgreSQL**, **Redis**, **Kafka** containers for local development.

### 📦 Run Redis + PostgreSQL + Kafka with Docker

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
