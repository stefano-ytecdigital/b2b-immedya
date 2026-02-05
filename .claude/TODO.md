# TODO - B2B LEDWall Platform Documentation

> **Ultimo aggiornamento**: 2026-02-05
> **Sessione**: Integrazione dati Salesforce reali

---

## In Corso

*Nessun task in corso*

---

## Da Fare

### Priorità Alta

- [ ] Verificare i valori esatti degli enum SF (Fase__c, Connessione_Internet__c, ecc.)
- [ ] Definire flusso sync bidirezionale Partner B2B ↔ User

### Priorità Bassa

- [ ] Creare seed data di esempio con struttura SF

---

## Completati

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

1. *punto 1*
2. *punto 2*
