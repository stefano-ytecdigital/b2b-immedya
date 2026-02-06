# TODO - B2B LEDWall Platform Documentation

> **Ultimo aggiornamento**: 2026-02-06
> **Sessione**: Animation System Implementation (E-commerce Premium)

---

## In Corso

*Nessuna task in corso*

---

**NOTA**: Layout transformation (dashboard → e-commerce) completata! ✅
- TopNav sostituisce Sidebar
- Container globale rimosso per hero sections full-width
- Server funzionante su localhost:5176

---

## Da Fare

### Priorità Alta

- [x] **Animation System - Sprint 1 (Week 1)**: Foundation + Quick Wins ✅
  - [x] Install: `npm install framer-motion`
  - [x] Integrate AnimatePresence in `__root.tsx`
  - [x] Wrap pages with AnimatedPage component
  - [x] Update KitCard con AnimatedCard (hover effects) - FATTO in Sprint 2
  - [ ] Test page transitions (3 browsers) - Richiede testing manuale utente
  - [ ] Lighthouse audit (target >90) - Rimandato a dopo implementazione completa

- [x] **Animation System - Sprint 2 (Week 2)**: Product Catalog ✅
  - [x] KitGrid con stagger animation (listContainerVariants)
  - [x] Skeleton loaders (componente pronto, usato nel catalog)
  - [x] Filter animations (fade-in con delay stagger)
  - [x] Card hover effects (lift + scale + shadow)
  - [ ] Image lazy load + fade-in - Non necessario (no immagini nei mock)
  - [ ] Performance test (50+ cards) - Da fare con dati reali

- [ ] **Animation System - Sprint 3 (Week 3)**: Hero + Polish
  - [ ] Hero section con stats counters
  - [ ] Floating badges
  - [ ] Success animations
  - [ ] Accessibility audit (reduced motion)

- [ ] **Frontend Fase 3: Catalog Slice**
  - Kit grid responsive (3 col desktop)
  - Filtri (pitch, indoor/outdoor)
  - Kit card con dati tecnici
  - Detail page kit

- [ ] **Frontend Fase 4: StandardConfigurator Wizard**
  - Wizard configurazione (5 step)
  - Canvas 2D preview
  - Integrazione API backend
  - Summary sidebar sticky

- [ ] **Frontend Fase 5: Dashboard Quotes**
  - Quotes table (TanStack Table)
  - Status badges
  - View quotazione read-only
  - Download PDF

### Priorità Media

- [ ] Configurare credenziali Salesforce in .env (per sync users)
- [ ] Configurare Google OAuth credentials (per admin login)

### Priorità Bassa

- [ ] Creare seed data prodotti/moduli/kit
- [ ] Verificare valori esatti enum SF se serve refine

---

## Completati

### 2026-02-06

- [x] **[20:40] Login Page Redesign - Split-Screen Premium** ✅
  - ✅ Split-screen layout (desktop): Hero left + Form right
  - ✅ Hero section con gradient primary-to-accent
  - ✅ FloatingBadge decorations (4 badges con delay stagger)
  - ✅ Stats grid nel hero (250+ prodotti, 50+ moduli, 24/7, 99%)
  - ✅ LoginForm refactor: rimosso Card wrapper, ora form puro
  - ✅ Mobile responsive: single column con logo in alto
  - ✅ Welcome text "Bentornato" + support link footer
  - ✅ Server compilato OK (localhost:5174)
  - File: `routes/login.tsx`, `features/auth/components/LoginForm.tsx`

- [x] **[20:15] Animation System Sprint 2 - Polish** ✅
  - ✅ Filter section fade-in animation (opacity + y translate, delay 0.2s)
  - ✅ Results count fade-in (delay 0.3s)
  - ✅ Syntax error fix (missing closing div tag)
  - ✅ Server restart e ricompilazione OK (localhost:5174)
  - Sprint 2 praticamente completo (stagger, hover, filters animated)

- [x] **[20:00] Catalog Grid - Kit Cards con Animations** ✅
  - ✅ Grid responsivo 3 colonne (lg), 2 (md), 1 (mobile)
  - ✅ KitCard component con hover animation (lift + scale + shadow)
  - ✅ Stagger animation per grid reveal (listContainerVariants + listItemVariants)
  - ✅ Filtri funzionanti: Search, Pixel Pitch, Indoor/Outdoor
  - ✅ Select component creato (@radix-ui/react-select installato)
  - ✅ Mock data 6 kit (vari pitch, indoor/outdoor)
  - ✅ Empty state con reset filtri
  - ✅ Badge per disponibilità e pixel pitch
  - ✅ Dati tecnici: dimensioni, risoluzione, moduli, prezzo
  - ✅ Font-technical class per dati (JetBrains Mono)
  - File: `routes/_authenticated/catalog/kits.tsx`, `ui/select.tsx`

- [x] **[19:30] Hero Landing Page WOW** ✅
  - ✅ Hero section full-width con gradient background
  - ✅ FloatingBadge decorative animations (3 badges con delay stagger)
  - ✅ StatCounter components con number animations (4 stats)
  - ✅ Feature cards section (3 features)
  - ✅ CTA sections con Link to catalog e configurator
  - ✅ Responsive layout (mobile-first)
  - ✅ Sostituito redirect automatico dopo login → ora mostra hero page
  - File: `routes/_authenticated/index.tsx`
  - Componenti usati: AnimatedPage, StatCounter, FloatingBadge, Card, Button

- [x] **[19:00] Layout Transformation: Dashboard → E-commerce** ✅
  - ✅ Created TopNav component (horizontal navigation, user dropdown menu)
  - ✅ Installed @radix-ui/react-dropdown-menu + created dropdown-menu.tsx component
  - ✅ Removed Sidebar component (persistent left nav)
  - ✅ Updated AppLayout: TopNav + full-width main area (no constraints)
  - ✅ Updated all pages: container management delegato alle singole pagine
  - ✅ Server build e avvio verificato (localhost:5176)
  - Impatto: Layout ora ha feel e-commerce, non più dashboard corporate
  - File modificati: AppLayout.tsx, TopNav.tsx (new), dropdown-menu.tsx (new), tutte le pagine route
  - File obsoleti: Sidebar.tsx, Header.tsx (sostituiti da TopNav)

- [x] **[18:30] Animation System - Sprint 1 Foundation COMPLETATO** ✅
  - ✅ Framer Motion installato (v11.14.5)
  - ✅ AnimatePresence integrato in __root.tsx con useRouterState per dynamic key
  - ✅ AnimatedPage wrapper aggiunto a tutte le route (login, catalog, configurator, quotes)
  - ✅ Page transitions funzionanti (fade + slide up/down)
  - ✅ Server build e avvio verificato (localhost:5175)
  - Note: KitCard hover effects rimandato a Fase 3 quando implementiamo catalog grid
  - File modificati: __root.tsx, login.tsx, kits.tsx, standard.tsx, quotes.tsx

- [x] **[17:00] Animation System - Design & Implementation**
  - ✅ Strategia animazioni per e-commerce premium definita
  - ✅ Scelta tech: Framer Motion (primary) + CSS Tailwind (fallback)
  - ✅ Roadmap 3 sprint (Foundation → Catalog → Hero)
  - ✅ Pattern architetturale: Variants system + Custom hooks
  - ✅ Creato sistema completo in `frontend/src/shared/animations/`:
    - constants.ts (easing, springs, durations)
    - variants.ts (pageVariants, cardVariants, buttonVariants, etc.)
    - hooks/useReducedMotion.ts (accessibility)
    - hooks/useScrollAnimation.ts (scroll-triggered)
    - hooks/useCountUp.ts (number counter)
    - components/AnimatedPage.tsx (route transitions)
    - components/AnimatedCard.tsx (product cards)
    - components/AnimatedButton.tsx (CTA micro-interactions)
    - components/SkeletonLoader.tsx (loading states)
    - components/StatCounter.tsx (dashboard stats)
    - components/FloatingBadge.tsx (hero decorations)
    - index.ts (barrel export)
  - ✅ USAGE_GUIDE.md con esempi concreti
  - ✅ ANIMATIONS_SETUP.md con installation steps
  - ✅ Performance checklist: GPU-accelerated only, 60fps target, <60kb bundle
  - ✅ Accessibility: prefers-reduced-motion auto-handled
  - Note: Approccio progressive enhancement, reactbits.dev-inspired

### 2026-02-06

- [x] **[15:45] Frontend Fase 1-2 (Setup + Auth + Layout) COMPLETATO** ✅
  - ✅ Vite + React + TypeScript inizializzato
  - ✅ Tailwind v3 configurato (downgrade da v4 beta)
  - ✅ Design system custom: Dark Slate + Professional Blue (#3EA5F9)
  - ✅ Fonts custom: Space Grotesk (UI) + JetBrains Mono (data)
  - ✅ Struttura cartelle feature-based (vertical slicing)
  - ✅ API client (Axios + token refresh interceptors)
  - ✅ Auth store (Zustand + localStorage persistence)
  - ✅ Auth API hooks (useLogin, useLogout, useCurrentUser)
  - ✅ LoginForm component (email/password + Google OAuth)
  - ✅ Layout completo (AppLayout, Sidebar, Header)
  - ✅ TanStack Router setup (file-based routing)
  - ✅ Routes protette con redirect automatico
  - ✅ shadcn/ui components base (Button, Input, Label, Card, Badge)
  - ✅ Placeholder pages (catalog, configurator, dashboard)
  - ✅ Server dev funzionante su localhost:5175

- [x] **[14:50] Sprint 7-9 StandardConfigurator Slice (Backend) COMPLETATO** ✅
  - ✅ POST /standard/calculate (validation + pricing)
  - ✅ POST /standard/quote/pdf (PDF generation con Puppeteer)
  - ✅ POST /standard/quote/confirm (DB + SF + email completo)
  - ✅ POST /webhooks/salesforce/quotation (webhook SF)
  - ✅ PdfService implementato (Puppeteer + XSS protection)
  - ✅ EmailService con attachments
  - ✅ Templates HTML (quote-pdf.html, quote-email.html, phase-change-email.html)
  - ✅ Webhook signature verification (HMAC-SHA256)
  - ✅ Idempotency check per webhook
  - ✅ WebhooksModule registrato e funzionante
  - ✅ Server build e avvio verificati

- [x] **[13:15] Sprint 5-6 Catalog Slice COMPLETATO** ✅
  - ✅ GET /catalog/products (lista con filtri)
  - ✅ GET /catalog/products/:id (dettaglio)
  - ✅ GET /catalog/modules (lista con filtri)
  - ✅ GET /catalog/modules/:id (dettaglio)
  - ✅ GET /catalog/kits (lista con filtri)
  - ✅ GET /catalog/kits/:id (dettaglio completo con moduli)
  - ✅ Admin CRUD: POST/PUT/DELETE per products, modules, kits
  - ✅ RolesGuard + @Roles decorator (ADMIN only)
  - ✅ Seed data: 3 prodotti, 5 moduli, 4 kit, 2 users
  - ✅ Tutti gli endpoint testati e funzionanti

- [x] **[13:05] Sprint 3-4 Auth Slice COMPLETATO** ✅
  - ✅ POST /auth/login (SF credentials validation)
  - ✅ GET /auth/google + /auth/google/callback (OAuth flow)
  - ✅ POST /auth/refresh (token renewal)
  - ✅ POST /auth/logout (invalidate refresh token)
  - ✅ GET /auth/me (current user info)
  - ✅ JWT Strategy + Google Strategy + Guards
  - ✅ @Public() e @CurrentUser() decorators
  - ✅ SalesforceService con cron sync (ogni 5min)
  - ✅ Tutti gli endpoint testati e funzionanti

- [x] **[11:40] Sprint 1-2 Infrastructure Setup COMPLETATO** ✅
  - Database PostgreSQL b2b_ledwall creato
  - .env configurato (DATABASE_URL + JWT secrets)
  - Migration Prisma applicata (tutte le tabelle create)
  - Server NestJS avviato e funzionante su :3000/api
  - Fix Prisma 7 adapter (@prisma/adapter-pg installato)
  - Connessione database verificata

- [x] **[15:00] Analisi Pashturing Progetto**
  - Analisi multidimensionale completa (tecnica, business, UX, system)
  - Identificati rischi critici (webhook security, SF downtime, password storage)
  - Definite metriche successo (tecniche, business, UX)
  - Raccomandato Phased Rollout → APPROVATO dall'utente
  - Output: Piano dettagliato 3 fasi in SECOND-BRAIN.md

- [x] **[15:10] Decisioni Strategiche Utente**
  - ✅ Approva Phased Rollout (Fase 1 → Fase 2 → Fase 3)
  - ✅ Sync User: one-way da SF (no bidirectional)
  - ✅ Preview 2D Canvas (no 3D per ora)
  - ✅ Procedere con Fase 1 MVP

- [x] **[15:20] Creazione TASK_001 Fase 1 MVP**
  - Creato dossier completo `.claude/TASK_001_phase1-mvp.md`
  - Setup task tracking (4 task: infra, auth, catalog, standard)
  - Piano 9 sprint dettagliato con checklist

### 2026-02-05

- [x] **[16:30] Documentazione Flusso Quotazione**
  - Aggiunto BACKEND.md sezione 8.1: Quotation Management (API, DTOs, Controller, Service, Webhook)
  - Aggiunto FRONTEND.md sezione 11.1: Quotation Components (Types, Hooks, Form, View, List)
  - Documentato flusso SF-driven: Sito crea starter → SF completa → Sito read-only
  - Aggiornato SECOND-BRAIN.md con decisione architetturale flusso quotazioni

- [x] **Integrazione strutture dati Salesforce** da Excel
  - Aggiornato OVERVIEW.md con mapping campi Partner B2B e Quotazione
  - Aggiornato BACKEND.md: schema Prisma con modelli User e Quotation completi
  - Aggiunti enum per picklist SF (QuotationPhase, InternetConnection, ecc.)
  - Aggiornato SECOND-BRAIN.md con dettagli integrazione SF

- [x] Creazione documentazione iniziale (OVERVIEW.md, BACKEND.md, FRONTEND.md)
- [x] Setup sistema memoria (TODO.md, SECOND-BRAIN.md)
- [x] Configurazione CLAUDE.md come cervello operativo

---

## Note Sessione

*Spazio per note rapide sulla sessione corrente*

---

## Blocchi e Dipendenze

| Task | Bloccato da | Motivo |
|------|-------------|--------|
| *esempio* | *decisione user* | *descrizione* |

---

## Prossima Sessione

*Cosa ricordare per la prossima sessione:*

1. **DECISIONE RICHIESTA**: Approccio Phased Rollout (3 fasi) vs Full Implementation
2. **BLOCKER**: Enum Salesforce (Fase__c, ecc.) per completare schema Prisma
3. **ARCHITETTURALE**: Sync User bidirezionale - definire single source of truth
4. Se approvato Fase 1: Creare TASK_001_phase1-infrastructure.md e iniziare setup
5. Considerare implementazione queue locale per resilienza SF downtime
6. Pianificare validazione signature webhook SF (security critica)
