# SECOND-BRAIN - B2B LEDWall Platform

> Cervello persistente del progetto. Contiene ragionamenti, decisioni, preferenze e appunti.

---

## Architettura e Decisioni

### Vertical Slicing (DECISIONE FONDAMENTALE)

**Decisione**: Architettura basata su 6 slice verticali
**Motivazione**: Ogni feature è self-contained, facilita sviluppo parallelo e manutenzione
**Slice definiti**:
1. Auth - Autenticazione e sessioni
2. Catalog - Prodotti, moduli, kit
3. StandardConfigurator - Kit pre-configurati (self-service)
4. CustomConfigurator - Configurazione expert con algoritmo
5. Orders - Tracking e gestione ordini
6. Admin - Pannello amministrazione

### Stack Tecnologico

| Layer | Tecnologia | Motivazione |
|-------|------------|-------------|
| Frontend | Vite + React + TypeScript | Build veloce, DX ottima, type-safe |
| UI | shadcn/ui + Tailwind v3 | Accessibile, customizzabile, stabile |
| Data/Routing | TanStack (Query, Router, Table, Form) | Type-safe, moderne best practices |
| State | Zustand (solo auth) | Leggero, persistence built-in |
| HTTP | Axios | Interceptors per token refresh |
| Backend | NestJS | Struttura enterprise, decorators |
| ORM | Prisma | Type-safe, migrations automatiche |
| Database | PostgreSQL | Robustezza, relazioni complesse |

### Autenticazione

**Decisione**: Sistema ibrido
- **Partner B2B**: Credenziali sincronizzate da Salesforce (no self-registration)
- **Admin**: Google OAuth -> automaticamente ruolo ADMIN

**Motivazione**: Sicurezza enterprise, single source of truth per utenti B2B

---

## Preferenze User

### Stile Comunicazione

- Preferisce domande specifiche prima di procedere
- Vuole essere trattato come PM/Developer/Engineer
- Apprezza spiegazioni tecniche dettagliate
- Lingua: Italiano con termini tecnici in inglese

### Decisioni di Design

- *Aggiungi preferenze man mano che emergono*

### Pattern Preferiti

- *Aggiungi pattern preferiti qui*

---

## Ragionamenti e Analisi

### [2026-02-06] - Analisi Pashturing Completa Progetto

**Contesto**: Richiesta analisi multidimensionale profonda prima dell'implementazione
**Metodologia**: Pashturing (ragionamento profondo + consulti agenti simulati + first principles)
**Dimensioni Analizzate**:
- 🏗️ Tecnica (Architecture + Security agents)
- 💼 Business (Business Strategy agent)
- 👤 Utente (UX agent)
- 🔗 Sistema (Integration agent)

**Risultati Chiave**:

1. **Punti di Forza Confermati**:
   - Vertical slicing eccellente per separazione concerns
   - Type-safety E2E (TypeScript + Prisma + TanStack)
   - Documentazione implementation-ready (raro pre-sviluppo)
   - Tech stack moderno ma production-proven

2. **Rischi Tecnici Identificati**:
   - ⚠️ **CRITICO**: Webhook SF richiede signature validation (security)
   - ⚠️ **ALTO**: Sync SF passwords (PwdPiatt__c) → necessita bcrypt locale
   - ⚠️ **MEDIO**: Polling 5min scala male → considerare SF Platform Events
   - ⚠️ **MEDIO**: Puppeteer PDF → necessita input sanitization (XSS)

3. **Raccomandazione Strategica**: **Phased Rollout in 3 Fasi**
   - **Fase 1 (MVP - 6 sett)**: Auth + Catalog + StandardConfigurator
   - **Fase 2 (Expansion - 4 sett)**: CustomConfigurator + Orders
   - **Fase 3 (Polish - 2 sett)**: Admin + Analytics
   - **Rationale**: Valore incrementale, feedback loop rapido, rischio distribuito

4. **Timeline Stimata Fase 1**: 9 sprint (18 settimane totali stimate)
   - Sprint 1-2: Infrastruttura (backend setup + frontend setup)
   - Sprint 3-4: Auth Slice (SF login + Google OAuth + sync cron)
   - Sprint 5-6: Catalog Slice (API + listing + filters)
   - Sprint 7-9: StandardConfigurator (wizard + PDF + SF integration)

5. **Metriche Successo Definite**:
   - Tecniche: <500ms API p95, Lighthouse >90
   - Business: 80% partner completano preventivo <10min, riduzione tempo 2h→5min
   - Utente: NPS >50, <5 bug critici primo mese

6. **Livello Confidenza**: 85% complessivo
   - ALTA (95%): Architettura solida, integration patterns
   - MEDIA (70%): Timeline (dipende da team size), performance algoritmo
   - BASSA (50%): User adoption, scalabilità polling con 100+ partner

**Decisioni Architetturali Critiche**:
- ✅ Confermare approccio SF-driven per quotazioni (già deciso)
- ✅ Implementare queue locale per resilienza SF downtime
- ✅ Webhook con idempotency keys + polling fallback
- ✅ **DECISO 2026-02-06**: Sync User one-way (SF → App), no bidirectional
- ✅ **DECISO 2026-02-06**: Preview 2D Canvas (three.js opzionale futuro)
- ✅ **DECISO 2026-02-06**: Phased Rollout approvato (Fase 1 MVP → Fase 2 → Fase 3)

**Prossimi Blocchi da Risolvere**:
1. 🔴 **BLOCKER**: Enum SF (Fase__c, Connessione_Internet__c) → schema Prisma incompleto
2. 🟡 **ARCHITETTURALE**: Flusso sync User (one-way vs bidirectional + conflict resolution)
3. 🟡 **UX**: Preview 3D necessario? (three.js vs Canvas 2D)

### [Data] - Creazione Documentazione

**Contesto**: Necessità di documentazione che permetta implementazione autonoma
**Analisi**: Consultati 4 agenti specializzati (backend-architect, database-architect, frontend-developer, ui-ux-designer)
**Risultato**: 3 documenti completi in /docs con dettaglio estremo

### [Data] - Sistema Memoria

**Contesto**: Claude perde contesto tra sessioni
**Soluzione**: Sistema TODO.md + SECOND-BRAIN.md per persistenza
**Implementazione**: File in .claude/, workflow definito in CLAUDE.md

---

## Appunti Tecnici

### Algoritmo Configuratore

L'algoritmo gira sul FRONTEND. Vincoli critici:
1. Dimensioni LEDWall = multipli esatti del modulo scelto
2. Pixel pitch deve essere uniforme
3. Receiving cards hanno limite massimo pixel gestibili

### Salesforce Integration

**Oggetti Custom SF identificati da Excel (2026-02-05):**

1. **Partner B2B** - Credenziali accesso piattaforma
   - `Partner__c` → `salesforceAccountId` (lookup Account)
   - `AuthPiatt__c` → `isActive` (checkbox)
   - `UserPiatt__c` → `email` (username login)
   - `PwdPiatt__c` → `passwordHash` (bcrypt)
   - `EmailOrdine__c` → `orderEmail`
   - `EmailAmm__c` → `billingEmail`

2. **Quotazione** - Preventivi e configurazioni
   - Auto-number `Name` → `salesforceQuoteNumber`
   - Molti campi progetto/installazione mappati
   - Alcuni campi nascosti (uso interno SF)
   - `Note_Riservato_a_YTEC__c` = READ-ONLY per partner

**Enum Salesforce Reali (2026-02-06 da SalesForceEnum.txt):**

| Campo SF | Enum Prisma | Valori |
|----------|-------------|--------|
| `Sistema_Ancoraggio__c` | `AnchoringSystem` | A Muro, A Pavimento, A Soffitto, Autoportante, Altro (specificare nelle note) |
| `Materiale_Sito_Installazione__c` | `AnchoringMaterial` | Cartongesso, Muro di Cemento Armato, Legno/Compensato, Vetro/Lamiera, Autoportante, Altro (specificare in Note) |
| `Gestione_Contenuti__c` | `ContentManagement` | direttamente dal cliente, da agenzia incaricata dal cliente, da Immedya (valutazione pacchetto) |
| `Tipologia_di_Contenuti__c` | `ContentType` | Pubblicitari/ADS, TV o Sorgente Esterna, Interattivi (solo per Totem Touch) |
| `Connessione_Internet__c` | `InternetConnection` | via Cavo, via Wi-Fi (almeno 4 su 5 di segnale), Router 4G LTE |
| `Fase__c` | `QuotationPhase` | Bozza, Inviato a YTEC, Preventivo Pronto, Chiuso |

**Webhook**: Cambio fase quotazione (Fase__c)
**Polling**: Sync partner ogni 5 minuti

### Design System Frontend (2026-02-06)

**Decisione**: Professional Blue (#3EA5F9) come primary color (richiesta utente)
**Motivazione**: Più professionale e trustworthy per B2B rispetto ad amber/gold

**Palette Finale**:
- Primary: Professional Blue #3EA5F9 (HSL: 207 96% 61%)
- Background: Dark Slate (industrial look)
- Accent: Teal #2db8a0 (data visualization)
- Fonts: Space Grotesk (UI) + JetBrains Mono (dati tecnici)

**Typography Rationale**:
- Space Grotesk: Geometrico, moderno, distintivo (NON Inter = template)
- JetBrains Mono: Dati tecnici (pixel pitch, dimensioni, SKU) con tabular numbers

**Riferimento**: Nielsen Norman Group - credibilità si forma in 50ms, typography + color = segnali primari

### Layout Architecture: Dashboard → E-commerce (2026-02-06)

**Problema Identificato**: Layout iniziale con sidebar persistente comunicava "dashboard corporate", non "shop premium"

**Decisione**: Trasformazione completa layout da dashboard a e-commerce
- ❌ RIMOSSO: Sidebar component (left persistent navigation)
- ❌ RIMOSSO: Header component (toolbar con user info)
- ❌ RIMOSSO: Global max-w-7xl container (soffocava hero sections)
- ✅ CREATO: TopNav component (horizontal navigation, sticky top)
- ✅ CREATO: User dropdown menu (Radix UI DropdownMenu)
- ✅ DELEGATO: Container management alle singole pagine (page-level control)

**Motivazione UX** (da ui-ux-designer agent):
1. Sidebar segnala "tool amministrativo", non esperienza shopping
2. Top nav = pattern e-commerce universale (Amazon, Shopify, Stripe)
3. Full-width hero sections = visual impact per WOW factor
4. Horizontal space = valorizza product photography

**Motivazione Tecnica**:
- Sticky top nav con backdrop-blur = modern web app feel
- Page-level containers = flessibilità (hero full-width, content contained)
- DropdownMenu accessibile (keyboard nav, screen readers)

**Componenti Obsoleti**:
- `Sidebar.tsx` - NON PIÙ USATO (sostituito da TopNav)
- `Header.tsx` - NON PIÙ USATO (funzioni integrate in TopNav)

**Note Implementazione**:
- TopNav usa `sticky top-0 z-50` per rimanere visibile durante scroll
- Backdrop blur con fallback: `bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60`
- User menu con Radix DropdownMenu (accessibilità built-in, keyboard navigation)
- Logo clickable → redirect a /catalog/kits (e-commerce pattern)

**Riferimento**: reactbits.dev (user request) - layout pulito, top nav, hero full-width

### Tailwind v3 vs v4 (2026-02-06)

**Problema**: Tailwind v4 (beta) ha breaking changes drastici:
- PostCSS plugin spostato in `@tailwindcss/postcss`
- CSS variables syntax completamente diversa
- `@layer` non funziona come v3
- Molti utilities class non riconosciuti

**Soluzione**: Downgrade a Tailwind v3 (stabile)
```bash
npm uninstall tailwindcss @tailwindcss/postcss
npm install -D tailwindcss@3
```

**Lesson**: Per progetti production, usare versioni stabili non beta

### Token Refresh Pattern (2026-02-06)

**Implementazione**: Axios response interceptor automatico
```typescript
// Response 401 → Try refresh → Retry original request
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      const { data } = await axios.post('/auth/refresh', { refreshToken });
      useAuthStore.getState().updateAccessToken(data.accessToken);
      return apiClient(originalRequest); // Retry
    }
    return Promise.reject(error);
  }
);
```

**Vantaggio**: Utente non si accorge del refresh, esperienza seamless

### Animation System Architecture (2026-02-06)

**Obiettivo**: Creare WOW factor come reactbits.dev, mantenendo 60fps e accessibilità

**Decisione Tecnica**: Framer Motion come libreria primary
- **Pro**: Declarative API, variants system, layout animations, gesture support
- **Pro**: Spring physics built-in, composable hooks
- **Pro**: Accessibility: auto-gestisce prefers-reduced-motion
- **Contro**: Bundle size ~60KB (accettabile per benefit UX)

**Alternative Escluse**:
- CSS animations: limitato per orchestration complesse
- React Spring: più low-level, meno declarative
- GSAP: overkill per questo use case, licenza commerciale

**Pattern Architetturale - Variants System**:
```typescript
// Centralized variants in variants.ts
export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
  hover: { y: -8, scale: 1.02, boxShadow: SHADOW_CARD_HOVER },
};

// Reusable component
<motion.div variants={cardVariants} initial="hidden" animate="visible" whileHover="hover">
```

**Performance Optimizations**:
1. GPU-accelerated properties only (transform + opacity)
2. willChange CSS quando necessario
3. Variants system evita inline objects (performance hit)
4. useReducedMotion hook per accessibility

**Componenti Creati**:
- `AnimatedPage`: Page transitions (fade + slide)
- `AnimatedCard`: Product cards hover/reveal
- `AnimatedButton`: CTA micro-interactions
- `SkeletonLoader`: Loading states
- `StatCounter`: Number animations
- `FloatingBadge`: Hero decorations

**Integrazione TanStack Router**:
```typescript
// __root.tsx
<AnimatePresence mode="wait" initial={false}>
  <Outlet key={location.pathname} />
</AnimatePresence>
```
- `mode="wait"`: Attende exit animation prima di entrare
- `initial={false}`: Disabilita animazione al mount iniziale (better UX)
- `key={location.pathname}`: Trigger animation on route change

**Sprint Roadmap**:
- Sprint 1 (Done): Foundation + Page transitions
- Sprint 2 (Next): Product catalog stagger animations
- Sprint 3 (Next): Hero section + polish

**Riferimenti**: reactbits.dev, Stripe, Linear (premium animation examples)

### Webhook Security Implementation (2026-02-06)

**Problema**: Webhook Salesforce vulnerabile a spoofing senza signature validation
**Soluzione Implementata**:
```typescript
// HMAC-SHA256 signature verification
const expectedSignature = crypto
  .createHmac('sha256', webhookSecret)
  .update(payload)
  .digest('base64');

// Constant-time comparison (prevent timing attacks)
const isValid = crypto.timingSafeEqual(
  Buffer.from(receivedSignature),
  Buffer.from(expectedSignature)
);
```

**Idempotency Check**:
```typescript
// Confronta lastSyncAt del DB con lastModifiedDate del webhook
// Se lastSyncAt >= webhookTimestamp → già processato
if (lastSync >= webhookTimestamp) return true;
```

**Fallback**: In development, se SALESFORCE_WEBHOOK_SECRET non configurato, accetta webhook (con warning log)

### Flusso Quotazioni (DECISIONE 2026-02-05)

**Modello SF-Driven**:
```
Partner compila form → Crea DRAFT locale → Submit → SF crea record → READ-ONLY
```

**Punti chiave decisi con l'utente**:
1. Il sito crea SOLO la quotazione "starter" (dati progetto + config tecnica)
2. Dopo invio a SF, la quotazione diventa **READ-ONLY** sul sito
3. Salesforce è la **source of truth** per:
   - Pricing finale (totalCostCents)
   - Fase quotazione (phase)
   - Note team (ytecNotes)
4. Webhook SF → aggiorna dati locali (cache)
5. Il Partner visualizza lo stato ma NON può modificare

**Campi editabili** (solo in DRAFT):
- Progetto: projectName, customerBudgetCents, installationCity, requestedDeliveryDate
- Installazione: internetConnection, contentType, contentManagement, anchoringSystem, anchoringMaterial
- Cliente: customerCategory, hasExistingSoftware, needsVideorender
- Note: productsDescription, commercialNotes, needsSiteSurvey
- Configurazione tecnica (dal wizard)

**Campi READ-ONLY** (da SF):
- salesforceQuoteId, salesforceQuoteNumber, phase, totalCostCents, ytecNotes, lastSyncAt

### Deploy Target

- PM2 per backend (Bitnami)
- Nginx per frontend statico
- Repository separati per frontend e backend

### Animation System (2026-02-06)

**Decisione**: Sistema animazioni premium per trasformare dashboard in e-commerce WOW

**Tech Choice**: Framer Motion (primary) + CSS Tailwind (fallback)
**Rationale**:
- Declarative React API (migliore DX)
- Tree-shakable (~60kb, ma solo ~20kb per base features)
- Spring physics superiori a CSS cubic-bezier
- Built-in useInView (no Intersection Observer manuale)
- AnimatePresence per route transitions (TanStack Router compatible)
- TypeScript first-class support
- Gesture support built-in (drag, hover, tap)

**Alternative scartate**:
- GSAP: Troppo imperativo per React, licensing issues, overkill B2B
- React Spring: Curva apprendimento alta, meno ecosistema
- CSS only: Limitato (no scroll-trigger senza JS, no complex orchestration)

**Architettura Pattern**: Variants System + Custom Hooks
- Centralized variants (pageVariants, cardVariants, buttonVariants)
- Custom hooks (useScrollAnimation, useReducedMotion, useCountUp)
- Reusable components (AnimatedCard, AnimatedButton, SkeletonLoader)
- Progressive enhancement (CSS fallback per hover/transitions)

**Performance Budget**:
- Bundle size animations: <60kb gzipped
- Lighthouse Performance: >90
- FPS durante animazioni: 60fps (no jank)
- First Contentful Paint: <1.5s
- Time to Interactive: <3.5s

**Accessibility**:
- Auto-rispetto prefers-reduced-motion (built-in hook)
- Animazioni <500ms (WCAG guideline)
- Focus states visibili
- No flashing (seizure risk prevention)

**Implementation Roadmap** (3 sprint):
1. Sprint 1 (Week 1): Foundation + Quick Wins (page transitions, button hover, card lift, skeleton)
2. Sprint 2 (Week 2): Product Catalog (scroll animations, stagger grid, lazy load)
3. Sprint 3 (Week 3): Hero Section + Polish (stats counter, floating elements, success animations)

---

## Problemi Risolti

| Problema | Soluzione | Data |
|----------|-----------|------|
| *descrizione problema* | *come risolto* | *data* |

---

## Domande Aperte

### BLOCKER (Richiedono Azione Immediata)
- [ ] **Enum Salesforce**: Verificare valori esatti picklist Fase__c, Connessione_Internet__c, ecc. → Schema Prisma incompleto
- [ ] **Sync Bidirezionale**: User locale vs Partner B2B SF - serve decisione su single source of truth per profile changes
  - Opzione A: SF → App (one-way, semplice)
  - Opzione B: Bidirectional (complesso, necessita conflict resolution)

### ARCHITECTURAL (Pianificazione)
- [ ] Preview 3D: Quanto critico visualizzare LEDWall in 3D vs 2D grid? Valutare three.js vs Canvas 2D
- [ ] Specifiche esatte per calcolo receiving cards (limiti pixel gestibili)
- [ ] SLA tempi risposta custom configurator: Partner deve vedere stima tempo?

### STRATEGIC (Business)
- [ ] Approvazione approccio Phased Rollout (3 fasi vs full implementation)
- [ ] Priorità features Fase 1: Conferma scope MVP (Auth + Catalog + StandardConfigurator)

---

## Lezioni Apprese

1. **Consultare sempre gli agenti specializzati** per decisioni architetturali
2. **Vertical slicing** semplifica enormemente la documentazione e lo sviluppo
3. **Analisi Pashturing pre-implementazione** identifica rischi tecnici e business prima di scrivere codice
4. **Security validation**: Webhook SF senza signature check = vulnerabilità critica (spoofing)
5. **Resilienza SF**: Downtime SF può bloccare tutto → necessaria queue locale offline-first
6. **Timeline realistiche**: Documentazione completa ≠ implementazione veloce (Fase 1 MVP = 6 settimane stimate)
7. **Phased rollout > Big Bang**: Valore incrementale + feedback loop + rischio distribuito
8. **Metriche successo anticipate**: Definire KPI tecnici/business/UX PRIMA dell'implementazione facilita validazione
9. **Webhook Security (2026-02-06)**: HMAC-SHA256 con crypto.timingSafeEqual per evitare timing attacks
10. **Idempotency Pattern (2026-02-06)**: Usare lastSyncAt timestamp per prevenire duplicate webhook processing
11. **Error Handling Resiliente (2026-02-06)**: Se SF API fail o email fail, continua comunque (log error, non bloccare flow)
12. **Tailwind v4 instabile (2026-02-06)**: Beta con breaking changes drastici, meglio v3 per production
13. **Design System Custom (2026-02-06)**: Typography + Color palette custom = credibilità immediata (50ms, Nielsen Norman)
14. **Token Refresh Pattern (2026-02-06)**: Axios interceptors gestiscono 401 automaticamente, retry trasparente per l'utente
15. **File-based Routing (2026-02-06)**: TanStack Router genera types automaticamente, scalabile e type-safe
16. **Animation Library Choice (2026-02-06)**: Framer Motion > GSAP/React Spring per React (declarative, tree-shakable, DX eccellente)
17. **Variants System Pattern (2026-02-06)**: Centralizzare animation variants = consistency, scalabilità, manutenibilità
18. **Progressive Enhancement Animazioni (2026-02-06)**: CSS per hover semplici, Framer Motion per WOW moments (performance balance)
19. **Scroll Animation Performance (2026-02-06)**: `once: true` + `margin: "-100px"` = no re-trigger, smooth UX
20. **Stagger Limit Pattern (2026-02-06)**: Limitare stagger a max 10 item (oltre → no delay) evita 10s+ attese su grid grandi
21. **Skeleton > Spinner (2026-02-06)**: Skeleton loaders mostrano struttura contenuto, UX superiore a spinner generici

---

## Link Utili Progetto

- Documentazione principale: `/docs/OVERVIEW.md`
- Backend dettagli: `/docs/BACKEND.md`
- Frontend dettagli: `/docs/FRONTEND.md`
- Agenti disponibili: `/.claude/agents/`