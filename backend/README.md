# B2B LEDWall Platform - Backend

NestJS backend per piattaforma B2B configurazione e preventivazione LEDWall.

## Stack Tecnologico

- **Framework**: NestJS 11
- **Database**: PostgreSQL + Prisma ORM
- **Autenticazione**: JWT + Passport (SF credentials + Google OAuth)
- **Integrazione**: Salesforce (jsforce)
- **Email**: Nodemailer (SMTP)
- **PDF**: Puppeteer
- **Scheduling**: @nestjs/schedule (cron jobs)

## Setup Completo

Vedi **SETUP.md** per guida step-by-step.

## Quick Start

```bash
# 1. Install
npm install

# 2. Configure .env
cp .env.example .env
# Modifica DATABASE_URL con le tue credenziali PostgreSQL

# 3. Database
createdb b2b_ledwall  # o via pgAdmin

# 4. Migrate
npx prisma generate
npx prisma migrate dev --name init

# 5. Run
npm run start:dev
```

Server: **http://localhost:3000/api**

## Riferimenti

- [Setup Guidato](./SETUP.md)
- [Documentazione Progetto](../docs/)

---

**Status**: 🟡 Sprint 1-2 Infrastructure
**Last Updated**: 2026-02-06
