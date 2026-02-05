# B2B LEDWall Configurator - Overview Architetturale

> Documento concettuale per sviluppatori umani e Claude Code.
> Ultima modifica: 2026-02-05

---

## Indice

1. [Introduzione](#1-introduzione)
2. [Architettura Generale](#2-architettura-generale)
3. [Vertical Slicing](#3-vertical-slicing)
4. [Tech Stack](#4-tech-stack)
5. [Flussi di Autenticazione](#5-flussi-di-autenticazione)
6. [Flusso Dati](#6-flusso-dati)
7. [Integrazione Salesforce](#7-integrazione-salesforce)
8. [API Design Philosophy](#8-api-design-philosophy)
9. [Algoritmo Configuratore](#9-algoritmo-configuratore)
10. [Glossario Dominio LEDWall](#10-glossario-dominio-ledwall)
11. [Guida Mentale per Sviluppatori](#11-guida-mentale-per-sviluppatori)

---

## 1. Introduzione

### Obiettivo del Progetto

Sviluppo di una piattaforma web **B2B** per la digitalizzazione del processo di preventivazione e vendita di LEDWall, integrata con **Salesforce CRM**.

### Valore di Business

- **Riduzione tempo preventivazione**: Da ore a minuti per configurazioni standard
- **Centralizzazione dati**: Tutti gli ordini e preventivi sincronizzati su Salesforce
- **Trasparenza**: Partner B2B possono tracciare lo stato dei propri ordini in tempo reale
- **Scalabilità**: Processo automatizzato permette gestione di più partner senza aumentare staff

### Due Macro-Flussi

| Flusso | Descrizione | Target |
|--------|-------------|--------|
| **Standard (Self-service)** | Kit LEDWall pre-configurati, preventivo PDF immediato | Partner autonomi |
| **Custom (Assistito)** | Configurazione expert con validazione tecnica | Progetti complessi |

---

## 2. Architettura Generale

### Diagramma High-Level

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              INTERNET                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         NGINX (Reverse Proxy)                                │
│                         - SSL Termination                                    │
│                         - Static Files (Frontend Build)                      │
│                         - API Proxy to Backend                               │
└─────────────────────────────────────────────────────────────────────────────┘
                    │                               │
                    ▼                               ▼
┌──────────────────────────────┐    ┌──────────────────────────────────────────┐
│        FRONTEND              │    │              BACKEND                      │
│   ┌────────────────────┐    │    │   ┌────────────────────────────────────┐ │
│   │   Vite + React     │    │    │   │          NestJS                    │ │
│   │   TanStack Full    │    │    │   │   ┌────────────────────────────┐   │ │
│   │   shadcn/ui        │    │    │   │   │   Vertical Slices          │   │ │
│   │                    │    │    │   │   │   - Auth                   │   │ │
│   │   - Configuratore  │    │    │   │   │   - Catalog                │   │ │
│   │   - Preview Canvas │    │    │   │   │   - StandardConfigurator   │   │ │
│   │   - Admin Panel    │    │    │   │   │   - CustomConfigurator     │   │ │
│   └────────────────────┘    │    │   │   │   - Orders                 │   │ │
│                              │    │   │   │   - Admin                  │   │ │
│   Static Build → Nginx       │    │   │   └────────────────────────────┘   │ │
└──────────────────────────────┘    │   │                                    │ │
                                    │   │   ┌────────────────────────────┐   │ │
                                    │   │   │   Infrastructure           │   │ │
                                    │   │   │   - Prisma ORM             │   │ │
                                    │   │   │   - Email Service          │   │ │
                                    │   │   │   - PDF Generator          │   │ │
                                    │   │   │   - Salesforce Client      │   │ │
                                    │   │   └────────────────────────────┘   │ │
                                    │   └────────────────────────────────────┘ │
                                    │              │           │               │
                                    │              ▼           ▼               │
                                    │   ┌──────────────┐ ┌─────────────────┐  │
                                    │   │  PostgreSQL  │ │ Google SMTP     │  │
                                    │   │  (Prisma)    │ │ Relay           │  │
                                    │   └──────────────┘ └─────────────────┘  │
                                    └──────────────────────────────────────────┘
                                                   │
                                                   ▼
                                    ┌──────────────────────────────────────────┐
                                    │           SALESFORCE CRM                  │
                                    │   - Lead/Opportunity Management           │
                                    │   - User Database (sync)                  │
                                    │   - Webhook Events                        │
                                    └──────────────────────────────────────────┘
```

### Separazione Repository

I progetti sono in **repository separati** per massima indipendenza:

| Repository | Contenuto | Deploy |
|------------|-----------|--------|
| `ledwall-frontend` | Vite + React + TanStack | Nginx static files |
| `ledwall-backend` | NestJS + Prisma | PM2 process manager |

### Comunicazione

- **Frontend ↔ Backend**: REST API con OpenAPI/Swagger
- **Backend ↔ Salesforce**: OAuth2 + REST API + Webhooks
- **Backend ↔ Database**: Prisma ORM (PostgreSQL)
- **Backend ↔ Email**: Google SMTP Relay (nodemailer)

---

## 3. Vertical Slicing

### Principio

Il codice è organizzato per **feature/dominio**, non per tipo tecnico. Ogni slice è autocontenuto e include tutto il necessario per quella funzionalità.

### I 6 Slice

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            VERTICAL SLICES                                   │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────────┬──────┤
│    AUTH     │   CATALOG   │  STANDARD   │   CUSTOM    │   ORDERS    │ADMIN │
│             │             │ CONFIGURATOR│ CONFIGURATOR│             │      │
├─────────────┼─────────────┼─────────────┼─────────────┼─────────────┼──────┤
│ Login       │ Prodotti    │ Kit browse  │ Dimensioni  │ Lista       │CRUD  │
│ Logout      │ Moduli      │ Kit select  │ Pitch       │ Dettaglio   │Prod. │
│ Session     │ Pitch       │ Quantità    │ Compatib.   │ Timeline    │Kit   │
│ Google OAuth│ Receiving   │ Preview     │ Calcolo     │ Documenti   │Config│
│ Salesforce  │ Cards       │ PDF Gen     │ Preview     │ Notifiche   │Stats │
│ Sync        │             │ Conferma    │ Submit SF   │             │      │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────┴──────┘
```

### Struttura Slice (Backend)

```
src/slices/<slice-name>/
├── <slice-name>.module.ts      # NestJS Module
├── <slice-name>.controller.ts  # REST endpoints
├── <slice-name>.service.ts     # Business logic
├── dto/                        # Data Transfer Objects
│   ├── create-*.dto.ts
│   ├── update-*.dto.ts
│   └── *-response.dto.ts
├── entities/                   # Domain entities
├── repositories/               # Data access layer
└── [specializations]/          # Es: engines/, state-machines/
```

### Struttura Slice (Frontend)

```
src/features/<slice-name>/
├── index.ts                    # Public exports
├── routes.tsx                  # TanStack Router routes
├── api/                        # TanStack Query hooks
│   ├── queries.ts
│   └── mutations.ts
├── components/                 # UI components
│   ├── <Component>.tsx
│   └── <Component>.test.tsx
├── hooks/                      # Custom hooks
├── utils/                      # Slice-specific utilities
└── types/                      # TypeScript types
```

### Vantaggi Vertical Slicing

1. **Comprensione**: Tutto il codice per una feature in un posto
2. **Team autonomy**: Team diversi possono lavorare su slice diversi
3. **Testing**: Test colocati con il codice
4. **Refactoring**: Modifiche isolate a singoli slice
5. **Onboarding**: Nuovi sviluppatori capiscono un pezzo alla volta

---

## 4. Tech Stack

### Frontend

| Tecnologia | Versione | Scopo |
|------------|----------|-------|
| **Vite** | 5.x | Build tool, dev server |
| **React** | 18.x | UI library |
| **TypeScript** | 5.x | Type safety |
| **TanStack Router** | 1.x | Routing type-safe |
| **TanStack Query** | 5.x | Data fetching/caching |
| **TanStack Table** | 8.x | Tabelle avanzate |
| **TanStack Form** | 1.x | Form management |
| **TanStack Virtual** | 3.x | Virtualizzazione liste |
| **shadcn/ui** | Latest | Componenti UI (Radix-based) |
| **Tailwind CSS** | 3.x | Styling utility-first |

### Backend

| Tecnologia | Versione | Scopo |
|------------|----------|-------|
| **NestJS** | 10.x | Framework backend |
| **TypeScript** | 5.x | Type safety |
| **Prisma** | 5.x | ORM |
| **PostgreSQL** | 15.x | Database relazionale |
| **Passport.js** | 0.7.x | Autenticazione |
| **JWT** | - | Token-based auth |
| **Puppeteer** | 22.x | PDF generation |
| **Nodemailer** | 6.x | Email sending |
| **Swagger** | 7.x | API documentation |

### Infrastructure

| Tecnologia | Scopo |
|------------|-------|
| **PM2** | Process manager backend |
| **Nginx** | Reverse proxy, static files |
| **Bitnami** | Hosting platform |
| **Google SMTP** | Email relay |

---

## 5. Flussi di Autenticazione

### Ruoli

| Ruolo | Come ottenerlo | Permessi |
|-------|----------------|----------|
| **PARTNER** | Login con credenziali Salesforce | Catalog, Configuratori, Orders propri |
| **ADMIN** | Login con Google OAuth | Tutto + Admin Panel |

### Flusso 1: Login Partner (Salesforce)

```
┌─────────┐     ┌─────────────┐     ┌─────────────┐     ┌────────────┐
│ Partner │     │  Frontend   │     │   Backend   │     │ Salesforce │
└────┬────┘     └──────┬──────┘     └──────┬──────┘     └─────┬──────┘
     │                 │                   │                  │
     │ 1. Email/Pass   │                   │                  │
     │────────────────>│                   │                  │
     │                 │ 2. POST /auth/login                  │
     │                 │──────────────────>│                  │
     │                 │                   │ 3. Validate creds│
     │                 │                   │─────────────────>│
     │                 │                   │ 4. User data     │
     │                 │                   │<─────────────────│
     │                 │                   │                  │
     │                 │                   │ 5. Find/Create   │
     │                 │                   │    local user    │
     │                 │                   │                  │
     │                 │ 6. JWT tokens     │                  │
     │                 │<──────────────────│                  │
     │ 7. Dashboard    │                   │                  │
     │<────────────────│                   │                  │
```

### Flusso 2: Login Admin (Google OAuth)

```
┌─────────┐     ┌─────────────┐     ┌─────────────┐     ┌────────────┐
│  Admin  │     │  Frontend   │     │   Backend   │     │   Google   │
└────┬────┘     └──────┬──────┘     └──────┬──────┘     └─────┬──────┘
     │                 │                   │                  │
     │ 1. Click Google │                   │                  │
     │────────────────>│                   │                  │
     │                 │ 2. GET /auth/google                  │
     │                 │──────────────────>│                  │
     │                 │ 3. Redirect       │                  │
     │<────────────────│──────────────────>│─────────────────>│
     │                 │                   │                  │
     │ 4. Google login │                   │                  │
     │────────────────────────────────────────────────────────>│
     │                 │                   │                  │
     │ 5. Callback with code              │                  │
     │<────────────────────────────────────────────────────────│
     │────────────────>│──────────────────>│                  │
     │                 │                   │ 6. Exchange code │
     │                 │                   │─────────────────>│
     │                 │                   │ 7. User profile  │
     │                 │                   │<─────────────────│
     │                 │                   │                  │
     │                 │                   │ 8. Create/Update │
     │                 │                   │    user as ADMIN │
     │                 │                   │                  │
     │                 │ 9. JWT tokens     │                  │
     │                 │<──────────────────│                  │
     │ 10. Admin Panel │                   │                  │
     │<────────────────│                   │                  │
```

### Token Strategy

| Token | Durata | Storage | Uso |
|-------|--------|---------|-----|
| **Access Token** | 15 minuti | Memory/localStorage | Ogni API call |
| **Refresh Token** | 7 giorni | httpOnly cookie | Rinnovare access token |

---

## 6. Flusso Dati

### Flusso Standard: Kit Pre-configurato

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FLUSSO STANDARD (SELF-SERVICE)                        │
└─────────────────────────────────────────────────────────────────────────────┘

Partner           Frontend              Backend              Salesforce
   │                  │                    │                     │
   │ 1. Browse Kit    │                    │                     │
   │─────────────────>│                    │                     │
   │                  │ GET /catalog/kits  │                     │
   │                  │───────────────────>│                     │
   │                  │ Kit list           │                     │
   │<─────────────────│<───────────────────│                     │
   │                  │                    │                     │
   │ 2. Select Kit    │                    │                     │
   │─────────────────>│                    │                     │
   │                  │ (Local state)      │                     │
   │                  │                    │                     │
   │ 3. Set quantity  │                    │                     │
   │─────────────────>│                    │                     │
   │                  │ (Local calc)       │                     │
   │                  │                    │                     │
   │ 4. Generate PDF  │                    │                     │
   │─────────────────>│                    │                     │
   │                  │ POST /standard/quote                     │
   │                  │───────────────────>│                     │
   │                  │                    │ Generate PDF        │
   │                  │                    │ (Puppeteer)         │
   │                  │ { pdfUrl }         │                     │
   │<─────────────────│<───────────────────│                     │
   │                  │                    │                     │
   │ 5. Confirm Order │                    │                     │
   │─────────────────>│                    │                     │
   │                  │ POST /standard/confirm                   │
   │                  │───────────────────>│                     │
   │                  │                    │ Create Opportunity  │
   │                  │                    │────────────────────>│
   │                  │                    │ SF Opportunity ID   │
   │                  │                    │<────────────────────│
   │                  │                    │                     │
   │                  │                    │ Create local Order  │
   │                  │                    │ (status: CONFERMATO)│
   │                  │                    │                     │
   │                  │                    │ Send email          │
   │                  │                    │─────> Google SMTP   │
   │                  │                    │                     │
   │                  │ { orderId }        │                     │
   │<─────────────────│<───────────────────│                     │
```

### Flusso Custom: Configurazione Expert

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          FLUSSO CUSTOM (ASSISTITO)                           │
└─────────────────────────────────────────────────────────────────────────────┘

Partner           Frontend              Backend              Salesforce
   │                  │                    │                     │
   │ 1. Input dims    │                    │                     │
   │─────────────────>│                    │                     │
   │                  │ (Validate local)   │                     │
   │                  │                    │                     │
   │ 2. Select pitch  │                    │                     │
   │─────────────────>│                    │                     │
   │                  │ GET /catalog/modules?pitch=X             │
   │                  │───────────────────>│                     │
   │                  │ Compatible modules │                     │
   │<─────────────────│<───────────────────│                     │
   │                  │                    │                     │
   │ 3. Calculate     │                    │                     │
   │─────────────────>│                    │                     │
   │                  │ ┌────────────────────────────────────┐  │
   │                  │ │ ALGORITMO FRONTEND                 │  │
   │                  │ │ - Calcola moduli necessari         │  │
   │                  │ │ - Calcola receiving cards          │  │
   │                  │ │ - Calcola risoluzione              │  │
   │                  │ │ - Stima prezzo                     │  │
   │                  │ └────────────────────────────────────┘  │
   │                  │                    │                     │
   │ 4. Preview       │                    │                     │
   │<─────────────────│ (Canvas render)    │                     │
   │                  │                    │                     │
   │ 5. Submit request│                    │                     │
   │─────────────────>│                    │                     │
   │                  │ POST /custom/submit                      │
   │                  │───────────────────>│                     │
   │                  │                    │ Create Lead         │
   │                  │                    │────────────────────>│
   │                  │                    │ Lead ID             │
   │                  │                    │<────────────────────│
   │                  │                    │                     │
   │                  │                    │ Create local Order  │
   │                  │                    │ (RICHIESTA_RICEVUTA)│
   │                  │                    │                     │
   │                  │                    │ Send confirmation   │
   │                  │                    │─────> Google SMTP   │
   │                  │                    │                     │
   │                  │ { requestId }      │                     │
   │<─────────────────│<───────────────────│                     │
   │                  │                    │                     │
   │                  │                    │ [Team tecnico]      │
   │                  │                    │ Valutazione...      │
   │                  │                    │                     │
   │                  │                    │ Webhook: status     │
   │                  │                    │<────────────────────│
   │                  │                    │ Update local order  │
   │                  │                    │                     │
   │ 6. Email update  │                    │                     │
   │<─────────────────────────────────────│                     │
```

---

## 7. Integrazione Salesforce

### Modalità di Integrazione

| Direzione | Metodo | Trigger |
|-----------|--------|---------|
| **App → Salesforce** | REST API | Creazione Quotazione |
| **Salesforce → App** | Webhook | Cambio stato/fase Quotazione |
| **Salesforce → App** | Polling | Fallback / Sync utenti partner |

### Oggetti Salesforce Utilizzati

| Oggetto SF | Uso nel Sistema |
|------------|-----------------|
| **Partner B2B** (custom) | Database utenti partner (credenziali login) |
| **Quotazione** (custom) | Preventivi e richieste configurazione |
| **Azienda** (Account) | Anagrafica clienti partner |

### Struttura Dati: Partner B2B

Oggetto custom per gestire le credenziali di accesso alla piattaforma.

| Campo SF | API Name | Tipo | Mapping DB | Note |
|----------|----------|------|------------|------|
| Partner | `Partner__c` | Lookup(Account) | `salesforceAccountId` | Link all'azienda |
| Attivo su piattaforma | `AuthPiatt__c` | Checkbox | `isActive` | Flag per abilitazione login |
| Username piattaforma | `UserPiatt__c` | Text | `email` | Usato come username |
| Password piattaforma | `PwdPiatt__c` | Text (masked) | `passwordHash` | Hash bcrypt locale |
| Email per ordini | `EmailOrdine__c` | Email | `orderEmail` | Notifiche ordini |
| Email amministrazione | `EmailAmm__c` | Email | `billingEmail` | Fatture/amministrativo |

### Struttura Dati: Quotazione

Oggetto custom per preventivi. Alcuni campi sono visibili al partner, altri riservati.

| Campo SF | API Name | Tipo | Visibilità | Mapping DB |
|----------|----------|------|------------|------------|
| Quotazione | `Name` | Auto Number | Visibile | `salesforceQuoteNumber` |
| Anagrafica Cliente | `Anagrafica_Cliente__c` | Lookup(Account) | Sistema | `salesforceAccountId` |
| Nome Progetto | `Nome_Progetto__c` | Text(255) | Visibile | `projectName` |
| Budget del cliente | `Budget_Cliente__c` | Currency | Visibile | `customerBudgetCents` |
| Città di Installazione | `Luogo_di_Installazione__c` | Text(255) | Visibile | `installationCity` |
| Data Consegna Richiesta | `Data_Richiesta__c` | Date | Visibile | `requestedDeliveryDate` |
| Fase | `Fase__c` | Picklist | Visibile | `phase` |
| Connessione Internet | `Connessione_Internet__c` | Picklist | Visibile | `internetConnection` |
| Cosa tratta il cliente? | `Categoria_merceologica_cliente__c` | Long Text | Visibile | `customerCategory` |
| Tipologia di Contenuti | `Tipologia_di_Contenuti__c` | Picklist | Visibile | `contentType` |
| I contenuti saranno gestiti | `Gestione_Contenuti__c` | Picklist | Visibile | `contentManagement` |
| I dispositivi saranno ancorati | `Sistema_Ancoraggio__c` | Picklist | Visibile | `anchoringSystem` |
| Materiale sito installazione | `Materiale_Sito_Installazione__c` | Picklist | Visibile | `anchoringMaterial` |
| Il cliente ha già un software? | `Software_Cliente__c` | Checkbox | Visibile | `hasExistingSoftware` |
| Ha bisogno di videorender? | `Videorender__c` | Checkbox | Da verificare | `needsVideorender` |
| Prodotti da quotare | `Prodotti_da_quotare__c` | Rich Text | Visibile | `productsDescription` |
| Note Commerciale | `Note_Commerciale__c` | Rich Text | Visibile | `commercialNotes` |
| Note Riservato YTEC | `Note_Riservato_a_YTEC__c` | Rich Text | **Read-only** | `ytecNotes` |
| Sopralluogo tecnico | `Sopralluogo_Tecnico__c` | Checkbox | Nascosto | `needsSiteSurvey` |
| Totale Costi | `Totale_Costi__c` | Roll-up | Sistema | `totalCostCents` |

### Campi Nascosti (Sistema)

Questi campi esistono in SF ma non vanno esposti nel form:
- `Centro_Commerciale__c` - Uso interno
- `Altre_Soluzioni__c` - Uso interno
- `Referente_Commerciale_Immedya__c` - Assegnazione commerciale
- `Opportunita__c` - Link opportunità
- `RecordTypeId` - Tipo record SF
- `OwnerId` - Proprietario record
- `CreatedById`, `LastModifiedById` - Audit

### Webhook Handler

```typescript
// Backend riceve webhook da Salesforce
POST /api/v1/orders/webhooks/salesforce

// Payload esempio
{
  "opportunityId": "006Dn000002xyzABC",
  "status": "IN_SPEDIZIONE",
  "timestamp": "2026-02-05T10:00:00Z",
  "metadata": {
    "trackingNumber": "XYZ123456789",
    "carrier": "DHL"
  }
}

// Backend:
// 1. Valida signature webhook
// 2. Trova ordine locale con salesforceOpportunityId
// 3. Aggiorna stato locale
// 4. Salva in OrderStatusHistory
// 5. Invia email notifica al partner
```

### Polling Strategy

```typescript
// Cron job ogni 5 minuti per sincronizzazione utenti
@Cron('*/5 * * * *')
async syncUsersFromSalesforce() {
  const contacts = await salesforce.getUpdatedContacts(lastSyncDate);
  for (const contact of contacts) {
    await this.userRepository.upsert(contact);
  }
}
```

---

## 8. API Design Philosophy

### Principi

1. **RESTful**: Risorse come nomi plurali, HTTP verbs per azioni
2. **Versioning**: `/api/v1/` prefix per future evoluzioni
3. **Consistency**: Stessa struttura response per tutti gli endpoint
4. **Documentation**: OpenAPI/Swagger auto-generato

### Response Format Standard

```typescript
// Successo singolo
{
  "data": { ... },
  "meta": {
    "timestamp": "2026-02-05T10:00:00Z"
  }
}

// Successo lista
{
  "data": [ ... ],
  "meta": {
    "total": 150,
    "page": 1,
    "pageSize": 20,
    "timestamp": "2026-02-05T10:00:00Z"
  }
}

// Errore
{
  "error": {
    "statusCode": 400,
    "message": "Validation failed",
    "details": [
      { "field": "width", "message": "Deve essere almeno 0.5m" }
    ]
  },
  "meta": {
    "timestamp": "2026-02-05T10:00:00Z",
    "path": "/api/v1/custom/calculate"
  }
}
```

### Naming Conventions

| Pattern | Esempio | Uso |
|---------|---------|-----|
| GET /resources | GET /products | Lista |
| GET /resources/:id | GET /products/123 | Singolo |
| POST /resources | POST /products | Crea |
| PUT /resources/:id | PUT /products/123 | Aggiorna intero |
| PATCH /resources/:id | PATCH /products/123 | Aggiorna parziale |
| DELETE /resources/:id | DELETE /products/123 | Elimina |
| POST /resources/:id/action | POST /orders/123/confirm | Azione custom |

### HTTP Status Codes

| Code | Significato | Quando usarlo |
|------|-------------|---------------|
| 200 | OK | GET, PUT, PATCH riusciti |
| 201 | Created | POST riuscito |
| 204 | No Content | DELETE riuscito |
| 400 | Bad Request | Validazione fallita |
| 401 | Unauthorized | Token mancante/invalido |
| 403 | Forbidden | Permessi insufficienti |
| 404 | Not Found | Risorsa non esiste |
| 409 | Conflict | Conflitto (es. SKU duplicato) |
| 500 | Server Error | Errore interno |

---

## 9. Algoritmo Configuratore

### Vincoli Hardware

| Vincolo | Descrizione |
|---------|-------------|
| **Dimensioni multiple** | Le dimensioni totali devono essere multipli esatti delle dimensioni del modulo |
| **Pitch uniforme** | Tutti i moduli devono avere lo stesso pixel pitch |
| **Limite receiving card** | Ogni receiving card supporta un numero massimo di pixel |

### Formule

```typescript
// Calcolo moduli necessari
modulesX = Math.ceil(targetWidth / moduleWidth)
modulesY = Math.ceil(targetHeight / moduleHeight)
totalModules = modulesX * modulesY

// Dimensioni effettive
actualWidth = modulesX * moduleWidth
actualHeight = modulesY * moduleHeight

// Risoluzione totale (in pixel)
pixelsPerModule = (moduleWidth / pitch) * (moduleHeight / pitch)
totalPixels = totalModules * pixelsPerModule
resolutionX = modulesX * (moduleWidth / pitch)
resolutionY = modulesY * (moduleHeight / pitch)

// Receiving cards necessarie
pixelsPerCard = 650000 // Tipico valore
receivingCards = Math.ceil(totalPixels / pixelsPerCard)
```

### Dove Gira

**Frontend** - Per i seguenti motivi:
- Feedback istantaneo senza latenza di rete
- Riduce carico server
- Funziona offline (configurazione salvata localmente)

Il backend **valida** i risultati prima di creare l'ordine.

---

## 10. Glossario Dominio LEDWall

| Termine | Definizione |
|---------|-------------|
| **LEDWall** | Schermo LED di grandi dimensioni composto da moduli |
| **Modulo** | Unità base del LEDWall, dimensioni tipiche 500x500mm o 500x1000mm |
| **Pixel Pitch** | Distanza in mm tra centri pixel adiacenti. Es: P2.5 = 2.5mm |
| **Receiving Card** | Scheda elettronica che controlla un gruppo di moduli |
| **Sending Card** | Scheda che invia il segnale video alle receiving card |
| **Kit** | Configurazione pre-assemblata di moduli + elettronica |
| **Indoor/Outdoor** | Classificazione per ambiente di utilizzo |
| **Risoluzione** | Numero totale di pixel (larghezza x altezza) |
| **Refresh Rate** | Frequenza di aggiornamento immagine (Hz) |
| **Luminosità** | Intensità luminosa in nits (cd/m²) |
| **Cabinet** | Struttura metallica che contiene i moduli |

### Relazioni

```
LEDWall
  └── composto da N Moduli
        └── ogni Modulo ha:
              - Dimensioni (mm)
              - Pixel Pitch (mm)
              - Risoluzione (pixel)
              - Peso (kg)
              - Consumo (W)
  └── controllato da M Receiving Cards
        └── ogni Card supporta X pixel
  └── alimentato da P Alimentatori
```

---

## 11. Guida Mentale per Sviluppatori

### Come Pensare a Questo Sistema

1. **È un sistema di preventivazione, non un e-commerce**
   - Non c'è carrello
   - Non c'è pagamento online
   - Il "checkout" è la generazione di un preventivo PDF

2. **Due velocità diverse**
   - Standard: tutto automatico, PDF immediato
   - Custom: richiede intervento umano (team tecnico)

3. **Salesforce è la source of truth**
   - Gli ordini "veri" vivono su Salesforce
   - Il nostro DB è una cache/mirror per performance
   - I webhook aggiornano il nostro stato

4. **I partner sono professionisti**
   - Conoscono la terminologia tecnica
   - Vogliono velocità, non hand-holding
   - L'UI deve essere efficiente, non "carina"

### Checklist Pre-Sviluppo

Prima di scrivere codice per una feature, verifica:

- [ ] In quale slice appartiene?
- [ ] Quali altri slice tocca?
- [ ] Richiede sync con Salesforce?
- [ ] Chi può accedere (PARTNER/ADMIN)?
- [ ] Serve validazione backend oltre a frontend?
- [ ] Genera email/notifiche?
- [ ] Deve essere tracciato in OrderStatusHistory?

### Pattern Comuni

**CRUD Admin**
```
Controller → Service → Repository → Prisma
                ↓
            Validation (DTO)
```

**Azione con side-effect**
```
Controller → Service → Repository
                ↓
            EmailService
                ↓
            SalesforceService
                ↓
            AuditLog
```

**Query con filtri**
```
Controller (query params) → Service (build where) → Repository (Prisma findMany)
                                                            ↓
                                                     Pagination helper
```

### Errori Comuni da Evitare

| Errore | Perché è problematico | Soluzione |
|--------|----------------------|-----------|
| Logica business nel controller | Non testabile, non riutilizzabile | Sposta nel service |
| Query N+1 | Performance pessima | Usa Prisma `include` |
| Mancata validazione backend | Frontend bypassabile | Valida sempre nel DTO |
| Stato locale quando serve sync | Dati stale | Usa TanStack Query |
| Console.log in produzione | Security risk, rumore | Usa Logger NestJS |
| Catch generico senza rethrow | Nasconde errori | Catch specifico o rethrow |

### Comandi Utili

```bash
# Backend
npm run start:dev          # Dev server con hot reload
npm run build              # Build produzione
npx prisma migrate dev     # Applica migrations
npx prisma studio          # GUI database
npx prisma generate        # Rigenera client

# Frontend
npm run dev                # Dev server
npm run build              # Build produzione
npm run preview            # Preview build locale

# Deploy
pm2 start ecosystem.config.js   # Avvia backend
pm2 logs                        # Vedi logs
pm2 reload all                  # Reload graceful
```

---

## Prossimi Passi

1. **Leggi** `BACKEND.md` per dettagli implementativi backend
2. **Leggi** `FRONTEND.md` per dettagli implementativi frontend
3. **Setup** ambiente locale seguendo le guide
4. **Inizia** dal tuo slice assegnato

---

*Documento generato per il progetto B2B LEDWall Configurator*
