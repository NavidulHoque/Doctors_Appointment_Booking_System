# Doctor Appointment Booking System

A full-featured backend for managing doctor appointments, payments, and real-time messaging — built as a **Bun + Turborepo monorepo** with NestJS, Supabase, and TypeORM.

## Tech Stack

| Concern | Technology |
|---|---|
| Runtime | Bun |
| Framework | NestJS v11 + Fastify |
| Monorepo | Turborepo |
| Auth | Supabase Auth (JWT / Bearer tokens) |
| Database | PostgreSQL + TypeORM (`synchronize: false`) |
| Realtime | Supabase Realtime broadcast channels |
| File Storage | Supabase Storage (signed URLs) |
| Payments | Stripe Express Connect |
| Email | Nodemailer (appointment reminders + admin alerts) |
| Rate Limiting | `@nestjs/throttler` (in-memory) |
| Scheduling | `@nestjs/schedule` cron decorators |
| Validation | Zod (env) + class-validator (DTOs) |
| API Docs | Swagger (`/docs`) |

## Monorepo Structure

```
.
├── apps/
│   └── backend/          # NestJS + Fastify application
│       └── src/
│           └── modules/  # appointment, auth, doctor, user, payment,
│                         # message, notification, review, uploads,
│                         # realtime, webhook, cron, email, supabase
├── packages/
│   ├── shared/           # Enums and error codes
│   ├── supabase/         # Admin + anon Supabase client factories
│   ├── database/         # TypeORM entities
│   └── validation/       # Zod env schema
├── turbo.json
├── bunfig.toml
└── package.json
```

## Features

- **Auth** — Supabase-managed registration, login (patient / doctor / admin), OTP-based password reset, and token refresh via Bearer tokens
- **Real-time messaging & notifications** — Supabase Realtime broadcast channels (replaces Socket.io + Kafka)
- **Appointments** — Full CRUD with role-based access, status management, and admin statistics
- **Payments** — Stripe Express Connect checkout sessions with per-doctor payouts; payment history filterable by status
- **File uploads** — Two-step signed URL flow via Supabase Storage (replaces Cloudinary + Multer)
- **Email** — Appointment reminders and admin alert emails via Nodemailer; auth emails handled by Supabase
- **Scheduled tasks** — Inactive user cleanup and expired session removal via cron decorators
- **Rate limiting** — In-memory throttling on all routes
- **Role-based access** — Doctor, Patient, and Admin guards on every protected route

## Environment Variables

Create a `.env` file in the root (or in `apps/backend/`):

```env
# App
NODE_ENV=development
PORT=3000

# Supabase
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=

# Database
DATABASE_URL=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Email (SMTP)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

# App config
ADMIN_EMAIL=
ADMIN_ID=
OTP_EXPIRY_MINUTES=10
FRONTEND_URL=
CORS_ORIGIN=
```

## Running Locally

```bash
git clone https://github.com/NavidulHoque/Doctors_Appointment_Booking_System.git
cd Doctors_Appointment_Booking_System

bun install
bun run dev:backend
```

No Docker required — Supabase provides Auth, Realtime, Storage, and the managed Postgres database.

Swagger docs are available at `http://localhost:3000/docs` once the server is running.
