# TASK_001: Fase 1 MVP - B2B LEDWall Platform

> **Stato**: 🟡 In Corso
> **Creato**: 2026-02-06
> **Slice**: AUTH + CATALOG + STANDARD (Multi-slice)
> **Priorità**: Alta
> **Timeline Stimata**: 6 settimane (9 sprint)

---

## Obiettivo

Implementare **Fase 1 MVP** della piattaforma B2B LEDWall con scope:
- ✅ **Auth Slice**: Login SF + Google OAuth + session management
- ✅ **Catalog Slice**: Browse prodotti/moduli/kit (read-only per partner)
- ✅ **StandardConfigurator Slice**: Self-service preventivi kit pre-configurati

**Valore consegnato**: Partner B2B possono autonomamente creare preventivi per kit standard, riducendo tempo da ~2h a <5min.

---

## Contesto

### Decisioni Strategiche (2026-02-06)

**Approvazione Utente**:
1. ✅ **Phased Rollout**: Implementazione in 3 fasi (MVP → Expansion → Polish)
2. ✅ **Sync User One-Way**: SF è source of truth, app sincronizza da SF (no bidirectional)
3. ✅ **Preview 2D**: Canvas 2D sufficiente per Fase 1 (three.js opzionale in futuro)
4. ✅ **Procedere con Fase 1** poi passare a Fase 2

**Rationale**:
- Valore incrementale: Partner usano subito
- Feedback rapido prima di investire in Fase 2
- Rischio distribuito su 3 fasi
- Documentazione già completa in `docs/`

### Architettura di Riferimento

**Backend**: NestJS + Prisma + PostgreSQL
- Vertical slicing: 3 slice (auth, catalog, standard-configurator)
- JWT: access 15min + refresh 7gg
- SF Integration: Polling 5min (users) + Webhook (quotation updates) + API calls (create quotation)
- Email: nodemailer SMTP

**Frontend**: Vite + React + TanStack + shadcn/ui
- TanStack Router (routes)
- TanStack Query (API caching)
- TanStack Table (listing)
- TanStack Form (forms)
- Zustand (auth state)

**Deploy**:
- Backend: PM2 cluster mode
- Frontend: Nginx static files
- Database: PostgreSQL (Bitnami)

---

## Piano di Implementazione

### Sprint 1-2: Infrastructure Setup (2 settimane)

**Backend**:
- [x] Inizializzare progetto NestJS
- [x] Setup Prisma + PostgreSQL connection
- [x] Schema Prisma completo (User, Product, Module, Kit, Quotation, RefreshToken)
  - ✅ Enum SF corretti da `SalesForceEnum.txt`
- [x] Configurazione JWT + Passport (dipendenze installate)
- [x] Salesforce client (jsforce installato)
- [x] Email service (nodemailer installato)
- [x] Environment variables (.env.example creato)
- [x] Prisma Client generato
- [x] ✅ PostgreSQL 18.1 verificato IN ESECUZIONE
- [ ] PM2 ecosystem file (quando deploy)
- [ ] **UTENTE**: Configurare .env (DATABASE_URL + JWT secrets)
- [ ] **UTENTE**: Creare database `b2b_ledwall` (via pgAdmin o psql)
- [ ] Eseguire migration: `npx prisma migrate dev --name init`
- [ ] Test: `npm run start:dev`

**Frontend**:
- [x] Inizializzare Vite + React + TypeScript ✅
- [x] Setup TanStack Router (file-based routing) ✅
- [x] Setup TanStack Query ✅
- [x] Installare shadcn/ui base components ✅
- [x] API client axios + interceptors (token refresh) ✅
- [x] Auth store (Zustand + persistence) ✅
- [x] Protected route wrapper (_authenticated layout) ✅
- [x] Layout base (header, sidebar) ✅
- [x] Tailwind v3 + design system custom (blue #3EA5F9) ✅
- [x] Fonts: Space Grotesk + JetBrains Mono ✅

**DevOps**:
- [ ] Repository Git (backend + frontend separati?)
- [ ] Scripts build/deploy
- [ ] Nginx configuration
- [ ] PostgreSQL database creation

---

### Sprint 3-4: Auth Slice (2 settimane)

**Backend API**:
- [ ] `POST /auth/login` - Validazione credenziali SF
  - Input: email (UserPiatt__c), password (PwdPiatt__c)
  - Output: JWT access + refresh tokens
  - ⚠️ **SECURITY**: Verificare se PwdPiatt__c è già bcrypt o plaintext
- [ ] `GET /auth/google` - Inizia OAuth flow
- [ ] `GET /auth/google/callback` - Completa OAuth, crea user ADMIN
- [ ] `POST /auth/refresh` - Rinnova access token
- [ ] `POST /auth/logout` - Invalida refresh token
- [ ] `GET /auth/me` - Current user info
- [ ] **Cron Job**: Sync users da SF ogni 5min
  - Query SF Partner B2B records
  - Upsert users locali (email, passwordHash, isActive, orderEmail, billingEmail)
  - Soft-delete users non più attivi SF

**Frontend Pages**:
- [x] `/login` - Form login (email/password) + Google OAuth button ✅
- [x] Login form validation (native) ✅
- [x] Auth store (Zustand): user, tokens, login/logout actions ✅
- [x] Axios interceptor: attach token, refresh on 401 ✅
- [x] Protected route wrapper (_authenticated) ✅
- [x] Redirect authenticated users → `/catalog/kits` ✅

**Testing**:
- [ ] Unit test auth service
- [ ] E2E test login flow

---

### Sprint 5-6: Catalog Slice (2 settimane)

**Backend API**:
- [ ] `GET /catalog/products` - Lista prodotti (filter: type, outdoorCompatible)
- [ ] `GET /catalog/modules` - Lista moduli (filter: productId, pitch)
- [ ] `GET /catalog/kits` - Lista kit (filter: type, pitch)
- [ ] `GET /catalog/kits/:id` - Dettaglio kit (include modules)
- [ ] **Admin only**:
  - [ ] `POST /catalog/products` - Crea prodotto
  - [ ] `PUT /catalog/products/:id` - Aggiorna prodotto
  - [ ] `DELETE /catalog/products/:id` - Elimina prodotto
  - [ ] (Stesso per modules, kits)

**Frontend Pages**:
- [ ] `/catalog/kits` - Listing kit con filtri
  - TanStack Table (sorting, pagination)
  - Filtri: pitch, type (STANDARD), indoor/outdoor
  - Card responsive design
- [ ] `/catalog/kits/:id` - Dettaglio kit
  - Specifiche tecniche
  - Moduli inclusi
  - Pulsante "Configura Preventivo"
- [ ] Componenti:
  - `KitCard.tsx`
  - `KitFilters.tsx`
  - `ModuleList.tsx`

**Seed Data**:
- [ ] Script Prisma seed con dati esempio (5 prodotti, 20 moduli, 10 kit)

**Testing**:
- [ ] Unit test catalog service
- [ ] E2E test kit browsing

---

### Sprint 7-9: StandardConfigurator Slice (3 settimane)

**Backend API**:
- [x] `POST /standard/calculate` - Validazione backend configurazione ✅
  - Input: kitId, quantity, projectData
  - Output: validationErrors, totalCost (se disponibile)
- [x] `POST /standard/quote/pdf` - Genera PDF preventivo ✅
  - Input: QuoteDTO (kit, quantity, customer, project)
  - Output: PDF buffer (Puppeteer)
  - Template HTML con logo, tabella moduli, pricing placeholder
  - ✅ **SECURITY**: Sanitizzazione input XSS (escapeHtml nel renderTemplate)
- [x] `POST /standard/quote/confirm` - Crea quotazione SF ✅
  - Input: QuoteDTO completo
  - Flow:
    1. Genera PDF (Puppeteer)
    2. Salva quotazione DB (status: DRAFT)
    3. Chiama SF API (crea Quotazione__c record)
    4. Aggiorna DB con salesforceQuoteId
    5. Invia email partner (PDF attached)
  - Output: { quotationId, salesforceQuoteId, pdfUrl }
  - ✅ **CRITICAL**: Gestione errore SF API (try-catch, continua se fail)

**Frontend Pages**:
- [ ] `/configurator/standard` - Wizard configurazione
  - **Step 1**: Selezione kit (riuso `/catalog/kits` con flow diverso)
  - **Step 2**: Quantity selector (1-100)
  - **Step 3**: Preview Canvas 2D
    - Render grid moduli
    - Dimensioni totali (width x height)
    - Pixel count
  - **Step 4**: Project form
    - projectName, customerBudgetCents, installationCity, requestedDeliveryDate
    - internetConnection, contentType, contentManagement
    - anchoringSystem, anchoringMaterial
    - customerCategory, hasExistingSoftware, needsVideorender
    - productsDescription, commercialNotes, needsSiteSurvey
  - **Step 5**: Riepilogo + conferma
- [ ] Componenti:
  - `StandardWizard.tsx` (stepper)
  - `KitSelector.tsx`
  - `QuantityInput.tsx`
  - `CanvasPreview2D.tsx`
  - `ProjectForm.tsx` (TanStack Form)
  - `QuoteSummary.tsx`
- [ ] `/quotes/:id` - View quotazione (read-only)
  - Mostra tutti campi progetto + config tecnica
  - Stato fase (phase badge)
  - Pulsante download PDF
  - Messaggi SF (ytecNotes) se presenti

**Email Templates**:
- [x] `quote-email.html` - Conferma invio preventivo ✅
- [x] `phase-change-email.html` - Cambio fase (da webhook SF) ✅

**SF Integration**:
- [x] Webhook endpoint `POST /webhooks/salesforce/quotation` ✅
  - ✅ Verifica signature SF (HMAC-SHA256, crypto.timingSafeEqual)
  - ✅ Aggiorna quotation locale (phase, totalCostCents, ytecNotes, lastSyncAt)
  - ✅ Invia email partner se cambio fase rilevante
  - ✅ Idempotency check (lastSyncAt >= webhookTimestamp)

**Testing**:
- [ ] Unit test configurator service (TODO)
- [ ] Unit test PDF generation (TODO)
- [ ] E2E test full wizard flow (TODO)
- [ ] Mock SF API calls (TODO)

---

## Decisioni Prese

| Data | Decisione | Motivazione |
|------|-----------|-------------|
| 2026-02-06 | **Phased Rollout approvato** | Valore incrementale, feedback rapido, rischio distribuito |
| 2026-02-06 | **Sync User one-way (SF → App)** | Semplificazione, SF è source of truth, no conflict resolution |
| 2026-02-06 | **Preview 2D Canvas** (no 3D) | Sufficiente per Fase 1, three.js opzionale futuro |
| 2026-02-06 | **Priorità Fase 1 → Fase 2** | MVP prima, Custom + Orders dopo validazione |

---

## Sessioni di Lavoro

### [2026-02-06] Sessione 3 - Frontend Setup + Auth + Layout ✅ COMPLETATO

**Obiettivo sessione**: Implementare Fase 1-2 frontend (Setup + Design System + Auth + Layout)
**Completato**:
- ✅ Vite + React + TypeScript inizializzato
- ✅ Tailwind CSS v3 installato (downgrade da v4 beta per stabilità)
- ✅ Design system custom implementato:
  - Primary color: Professional Blue #3EA5F9 (decisione utente)
  - Background: Dark Slate (industrial look)
  - Fonts: Space Grotesk (UI) + JetBrains Mono (dati tecnici)
- ✅ Struttura cartelle feature-based (auth, catalog, configurator, dashboard)
- ✅ Path alias @/ configurato (tsconfig + vite.config)
- ✅ Utility functions (cn, formatCurrency, formatDate)
- ✅ API client completo:
  - Axios instance con baseURL
  - Request interceptor (attach access token)
  - Response interceptor (auto token refresh on 401)
- ✅ Auth store Zustand:
  - Persistence in localStorage (user + refreshToken)
  - Actions: setAuth, clearAuth, updateAccessToken
- ✅ Auth API hooks (useLogin, useLogout, useCurrentUser)
- ✅ LoginForm component:
  - Email/password form
  - Google OAuth button
  - Error handling
  - Loading states
- ✅ Layout components:
  - AppLayout (wrapper con sidebar + header)
  - Sidebar (navigation + logout)
  - Header (user info + role badge)
- ✅ shadcn/ui components base:
  - Button, Input, Label, Card, Badge
  - Radix UI dependencies
- ✅ TanStack Router setup:
  - File-based routing
  - __root.tsx (QueryClientProvider)
  - login.tsx (public)
  - _authenticated.tsx (protected wrapper)
  - Placeholder pages (catalog, configurator, dashboard)
- ✅ Routes protette con redirect automatico
- ✅ Server dev funzionante (localhost:5175)
- ✅ Type safety completo (API types condivisi)

**Decisioni tecniche**:
- Tailwind v3 (stabile) invece di v4 (beta con breaking changes)
- Primary color blue #3EA5F9 invece di amber (decisione utente)
- File-based routing (scalabile, type-safe)
- Feature-based folder structure (consistente con backend)

**Prossimi passi**:
- 🎯 **FRONTEND Fase 3**: Catalog slice (kit grid, filtri, detail)
- 🎯 **FRONTEND Fase 4**: StandardConfigurator wizard (5 step)
- 🎯 **FRONTEND Fase 5**: Dashboard quotes (table)

---

### [2026-02-06] Sessione 2 - StandardConfigurator Backend ✅ COMPLETATO

**Obiettivo sessione**: Completare backend StandardConfigurator + Webhook Salesforce
**Completato**:
- ✅ Verificato stato esistente (controller, service, DTOs già implementati)
- ✅ Verificato PdfService e EmailService funzionanti
- ✅ Creato WebhooksModule completo:
  - WebhooksController con endpoint POST /webhooks/salesforce/quotation
  - WebhooksService con signature verification (HMAC-SHA256)
  - Idempotency check (lastSyncAt)
  - Phase change email notifications
  - SalesforceQuotationWebhookDto
- ✅ Template HTML: phase-change-email.html
- ✅ Registrato WebhooksModule in AppModule
- ✅ Fix TypeScript error (lastSync possibly undefined)
- ✅ Build backend verificato (no errors)
- ✅ Server avvio verificato (tutti moduli caricati)
- ✅ Aggiornato TODO.md e TASK_001.md

**Prossimi passi**:
- 🎯 **FRONTEND**: Inizializzare Vite + React + TanStack
- 🎯 **FRONTEND**: Implementare wizard StandardConfigurator (5 step)
- 🎯 **FRONTEND**: Canvas 2D preview

---

### [2026-02-06] Sessione 1 - Planning e Infrastructure Setup ✅ COMPLETATO

**Obiettivo sessione**: Planning completo + Setup backend NestJS + Prisma + Database + Server running
**Completato**:
- ✅ Analisi Pashturing progetto (rischi, opportunità, metriche)
- ✅ Approvazione utente per Phased Rollout
- ✅ Creazione TASK_001_phase1-mvp.md
- ✅ Setup task tracking (4 task creati: infra, auth, catalog, standard)
- ✅ Aggiornamento SECOND-BRAIN.md e TODO.md con enum SF reali
- ✅ Inizializzato NestJS 11 in `backend/`
- ✅ Installate dipendenze (Prisma, Passport, JWT, jsforce, nodemailer, puppeteer)
- ✅ Creato schema Prisma completo con enum SF corretti
- ✅ PrismaModule + ConfigModule + ScheduleModule
- ✅ File .env.example con tutte le variabili
- ✅ Aggiornato main.ts (CORS, validation pipe, logging)
- ✅ Struttura cartelle vertical slicing (src/slices/)
- ✅ Generato Prisma Client TypeScript
- ✅ Creato README.md e SETUP.md

- ✅ Database b2b_ledwall creato (PostgreSQL 18.1)
- ✅ Configurato .env (DATABASE_URL + JWT secrets generati)
- ✅ Migration Prisma eseguita (tabelle create)
- ✅ Fix Prisma 7: installato @prisma/adapter-pg + pg
- ✅ Server NestJS avviato e funzionante
- ✅ Connessione database verificata
- ✅ Test API endpoint: http://localhost:3000/api risponde

**Prossimi passi**:
- ✅ Sprint 1-2 Infrastructure COMPLETATO
- ✅ Sprint 3-4 Auth Slice COMPLETATO
- ✅ Sprint 5-6 Catalog Slice COMPLETATO
- ✅ Sprint 7-9 StandardConfigurator (Backend) COMPLETATO
- 🎯 **PROSSIMO**: Sprint 7-9 StandardConfigurator (Frontend) - Wizard + Canvas 2D

---

## Blocchi e Dipendenze

| Blocco | Stato | Risoluzione |
|--------|-------|-------------|
| **Enum Salesforce** (Fase__c, Connessione_Internet__c, ecc.) | 🔴 APERTO | Necessaria sessione discovery SF per valori esatti picklist |
| **PwdPiatt__c format** | 🟡 DA VERIFICARE | Confermare se SF salva già bcrypt hash o plaintext |
| **SF Webhook signature** | 🟡 DA IMPLEMENTARE | Trovare documentazione SF per validazione signature |

---

## Note Tecniche

### Rischi Tecnici Identificati (Analisi Pashturing)

1. **Webhook SF Security** ⚠️ CRITICO
   - Rischio: Spoofing se nessuna validazione signature
   - Mitigazione: Implementare signature check (SF fornisce header?)
   - Fallback: IP whitelist SF + idempotency keys

2. **SF API Downtime** ⚠️ ALTO
   - Rischio: Partner non può creare quotazioni se SF down
   - Mitigazione: Queue locale (Redis?) con retry exponential backoff
   - Fallback: Polling già presente ogni 5min per sync users

3. **Puppeteer PDF Stability** ⚠️ MEDIO
   - Rischio: OOM errors, timeout, crash
   - Mitigazione: Resource limits container, timeout 30s, retry logic
   - Fallback: HTML template semplice se Puppeteer fail

4. **Password Storage** ⚠️ ALTO
   - Rischio: Se PwdPiatt__c è plaintext su SF → vulnerabilità
   - Mitigazione: Re-hash locale con bcrypt, non salvare plaintext
   - **TODO**: Verificare con SF admin formato attuale

### Metriche Successo Fase 1

**Tecniche**:
- [ ] <500ms API response time (p95)
- [ ] >90 Lighthouse score
- [ ] 100% test coverage business logic critica
- [ ] Zero downtime deployments (PM2 cluster)

**Business**:
- [ ] 80% partner completano primo preventivo <10min da login
- [ ] Riduzione tempo preventivazione Standard: 2h → <5min
- [ ] >50% partner usano self-service vs custom request

**UX**:
- [ ] NPS >50 dopo primo mese produzione
- [ ] <5 bug critici primo mese
- [ ] <10% richieste supporto per usabilità

### Riferimenti Documentazione

- Architettura generale: `/docs/OVERVIEW.md`
- Backend dettagli: `/docs/BACKEND.md` (NestJS, Prisma, API endpoints)
- Frontend dettagli: `/docs/FRONTEND.md` (React, TanStack, components)
- SF Integration: `/docs/OVERVIEW.md` § 5 (Webhook, Polling, API)

---

## Completamento

**Data completamento**: [TBD]
**Lessons learned**: [TBD]
**Da documentare in SECOND-BRAIN**: [TBD]
