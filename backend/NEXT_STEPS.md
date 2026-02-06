# 🎯 Prossimi Step - Setup Backend

## ✅ Completato

- ✅ NestJS 11 inizializzato
- ✅ Schema Prisma con enum Salesforce reali
- ✅ Dipendenze installate (Prisma, JWT, Passport, Salesforce, Email, PDF)
- ✅ Prisma Client generato
- ✅ Moduli base (PrismaModule, ConfigModule, ScheduleModule)
- ✅ Struttura vertical slicing (src/slices/)

---

## 🔧 Azioni Richieste (DA TE)

### 1. Configurare .env

Copia `.env.example` → `.env`:

```bash
cp .env.example .env
```

Modifica `.env` con:

#### a) DATABASE_URL (CRITICO)

Trova password PostgreSQL e modifica:
```env
DATABASE_URL="postgresql://postgres:TUA_PASSWORD_QUI@localhost:5432/b2b_ledwall?schema=public"
```

#### b) JWT Secrets (CRITICO)

Genera 2 secret random:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copia output in:
```env
JWT_ACCESS_SECRET=<primo-secret-qui>
JWT_REFRESH_SECRET=<secondo-secret-qui>
```

(Riesegui il comando per avere 2 secret diversi)

#### c) Altri campi (OPZIONALI ora, necessari poi)

Per ora lascia così. Quando serviranno per test:
- SALESFORCE_* (per sync partners e quotazioni)
- GOOGLE_* (per OAuth admin)
- SMTP_* (per email notifiche)

---

### 2. Creare Database PostgreSQL

**Opzione A - Command Line**:
```bash
psql -U postgres
CREATE DATABASE b2b_ledwall;
\q
```

**Opzione B - pgAdmin (GUI)**:
1. Apri pgAdmin
2. Right-click "Databases" → "Create" → "Database"
3. Nome: `b2b_ledwall`
4. Save

---

### 3. Eseguire Migration Prisma

```bash
cd C:\Progetti\B2B\b2b-immedya\backend

npx prisma migrate dev --name init
```

Questo crea le tabelle nel database.

---

### 4. Testare Server

```bash
npm run start:dev
```

**Se tutto OK, vedrai**:
```
🚀 Application running on: http://localhost:3000/api
📚 Environment: development
Successfully connected to database
```

Testa: http://localhost:3000/api (dovrebbe rispondere)

---

## 🐛 Troubleshooting

### Errore: "Can't reach database server"

**Soluzione**:
1. Verifica PostgreSQL sia running (Services Windows o `pg_ctl status`)
2. Controlla username/password in `.env`
3. Testa: `psql -U postgres -h localhost`

### Errore: "database b2b_ledwall does not exist"

**Soluzione**: Crea database (vedi Step 2)

### Errore: "Environment variable not found: DATABASE_URL"

**Soluzione**: Hai creato `.env` dalla copia di `.env.example`?

---

## 📋 Dopo Setup Completo

Una volta che il server parte correttamente, dimmi e procediamo con:

**Sprint 3-4: Auth Slice**
- Login SF credentials
- Google OAuth admin
- JWT tokens (access + refresh)
- Cron sync users da SF

---

**File di riferimento**:
- `README.md` - Overview progetto
- `.env.example` - Template variabili
- `prisma/schema.prisma` - Schema database

**Documentazione completa**: `../docs/BACKEND.md`
