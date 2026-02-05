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
| Frontend | Vite + React | Build veloce, DX ottima |
| UI | shadcn/ui | Ottimizzato per AI, accessibile |
| Data/Routing | TanStack (Query, Router, Table, Form, Virtual) | Type-safe, moderne best practices |
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

**Webhook**: Cambio fase quotazione (Fase__c)
**Polling**: Sync partner ogni 5 minuti

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

---

## Problemi Risolti

| Problema | Soluzione | Data |
|----------|-----------|------|
| *descrizione problema* | *come risolto* | *data* |

---

## Domande Aperte

- [ ] Definizione esatta Salesforce Objects per integrazione
- [ ] Specifiche esatte per calcolo receiving cards (limiti pixel)
- [ ] *Aggiungi domande qui*

---

## Lezioni Apprese

1. **Consultare sempre gli agenti specializzati** per decisioni architetturali
2. **Vertical slicing** semplifica enormemente la documentazione e lo sviluppo
3. *Aggiungi lezioni qui*

---

## Link Utili Progetto

- Documentazione principale: `/docs/OVERVIEW.md`
- Backend dettagli: `/docs/BACKEND.md`
- Frontend dettagli: `/docs/FRONTEND.md`
- Agenti disponibili: `/.claude/agents/`