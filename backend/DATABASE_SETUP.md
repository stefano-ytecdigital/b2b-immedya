# 🗄️ Setup Database PostgreSQL

## ✅ Stato Attuale

**PostgreSQL 18.1 è installato e IN ESECUZIONE** ✅

```
Service: postgresql-x64-18
Status: Running
Location: C:\Program Files\PostgreSQL\18\
```

---

## 📋 Step per Creare Database

### Opzione 1: pgAdmin (CONSIGLIATO - GUI)

1. **Apri pgAdmin 4**
   - Cerca "pgAdmin" nel menu Start
   - Ti chiederà una Master Password (se è la prima volta, impostala)

2. **Connettiti al server PostgreSQL**
   - Espandi "Servers" nella sidebar sinistra
   - Click su "PostgreSQL 18"
   - Ti chiederà la password di `postgres` (quella che hai impostato durante installazione)

3. **Crea database**
   - Right-click su "Databases"
   - "Create" → "Database..."
   - Name: `b2b_ledwall`
   - Owner: `postgres`
   - Click "Save"

✅ **Database creato!**

---

### Opzione 2: Command Line (psql)

Apri **Command Prompt** o **PowerShell** come amministratore:

```bash
# Naviga alla cartella bin di PostgreSQL
cd "C:\Program Files\PostgreSQL\18\bin"

# Connettiti come utente postgres
psql -U postgres

# Crea database
CREATE DATABASE b2b_ledwall;

# Verifica
\l

# Esci
\q
```

Ti chiederà la password di `postgres` (quella dell'installazione).

---

## 🔑 Credenziali PostgreSQL

Durante l'installazione hai impostato:
- **Username**: `postgres` (default)
- **Password**: ??? (quella che HAI IMPOSTATO tu)
- **Host**: `localhost`
- **Port**: `5432` (default)

**Non ricordi la password?**
→ Dovrai reimpostarla o reinstallare PostgreSQL.

---

## 🔧 Configurare .env Backend

Una volta creato il database, modifica `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:TUA_PASSWORD@localhost:5432/b2b_ledwall?schema=public"
```

**Esempio concreto** (se password è `admin123`):
```env
DATABASE_URL="postgresql://postgres:admin123@localhost:5432/b2b_ledwall?schema=public"
```

---

## 🚀 Prossimi Step

Dopo aver creato il database:

### 1. Genera JWT Secrets

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Metti in `.env`:
```env
JWT_ACCESS_SECRET=<output1>
JWT_REFRESH_SECRET=<output2>
```

### 2. Esegui Migration Prisma

```bash
cd C:\Progetti\B2B\b2b-immedya\backend
npx prisma migrate dev --name init
```

Questo crea le tabelle nel database.

### 3. Avvia Server

```bash
npm run start:dev
```

**Se vedi**:
```
🚀 Application running on: http://localhost:3000/api
Successfully connected to database
```

✅ **TUTTO OK!** Sei pronto per Sprint 3-4 (Auth Slice).

---

## 🐛 Troubleshooting

### Errore: "password authentication failed for user postgres"

**Causa**: Password errata in `.env`

**Soluzione**:
1. Verifica password in pgAdmin (se riesci a connetterti lì)
2. Usa quella stessa password in `.env`

### Errore: "database b2b_ledwall does not exist"

**Soluzione**: Segui "Opzione 1: pgAdmin" sopra per creare il database

### pgAdmin chiede Master Password

**Causa**: Prima apertura di pgAdmin

**Soluzione**: Imposta una password qualsiasi (la userai solo per aprire pgAdmin, non è la password del database)

---

**Dopo setup completo, dimmi e procediamo con Auth Slice!** 🎯
