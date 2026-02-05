# B2B LEDWall Configurator - Documentazione Backend

> Documentazione tecnica completa per NestJS + Prisma + PostgreSQL
> Ultima modifica: 2026-02-05

---

## Indice

1. [Setup Progetto](#1-setup-progetto)
2. [Struttura Cartelle](#2-struttura-cartelle)
3. [Configurazione](#3-configurazione)
4. [Schema Database (Prisma)](#4-schema-database-prisma)
5. [Slice: Auth](#5-slice-auth)
6. [Slice: Catalog](#6-slice-catalog)
7. [Slice: Standard Configurator](#7-slice-standard-configurator)
8. [Slice: Custom Configurator](#8-slice-custom-configurator)
9. [Slice: Orders](#9-slice-orders)
10. [Slice: Admin](#10-slice-admin)
11. [Infrastructure Services](#11-infrastructure-services)
12. [Guards e Middleware](#12-guards-e-middleware)
13. [Error Handling](#13-error-handling)
14. [Deploy e PM2](#14-deploy-e-pm2)

---

## 1. Setup Progetto

### Inizializzazione

```bash
# Crea progetto NestJS
npx @nestjs/cli new ledwall-backend
cd ledwall-backend

# Installa dipendenze core
npm install @nestjs/config @nestjs/swagger swagger-ui-express
npm install @prisma/client
npm install @nestjs/passport passport passport-jwt passport-google-oauth20
npm install @nestjs/jwt
npm install bcrypt class-validator class-transformer
npm install nodemailer puppeteer
npm install @nestjs/axios axios

# Installa dev dependencies
npm install -D prisma
npm install -D @types/passport-jwt @types/passport-google-oauth20
npm install -D @types/bcrypt @types/nodemailer

# Inizializza Prisma
npx prisma init
```

### Struttura package.json

```json
{
  "name": "ledwall-backend",
  "version": "1.0.0",
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "prisma:seed": "ts-node prisma/seed.ts"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/config": "^3.1.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.2",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/swagger": "^7.1.0",
    "@nestjs/axios": "^3.0.0",
    "@prisma/client": "^5.7.0",
    "axios": "^1.6.0",
    "bcrypt": "^5.1.0",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.0",
    "nodemailer": "^6.9.0",
    "passport": "^0.7.0",
    "passport-google-oauth20": "^2.0.0",
    "passport-jwt": "^4.0.1",
    "puppeteer": "^22.0.0",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1",
    "swagger-ui-express": "^5.0.0"
  }
}
```

---

## 2. Struttura Cartelle

```
src/
├── main.ts                          # Entry point
├── app.module.ts                    # Root module
├── app.controller.ts                # Health check
├── app.service.ts
│
├── config/                          # Configurazioni
│   ├── app.config.ts
│   ├── database.config.ts
│   ├── jwt.config.ts
│   ├── salesforce.config.ts
│   └── email.config.ts
│
├── common/                          # Shared utilities
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   ├── roles.decorator.ts
│   │   └── public.decorator.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   ├── roles.guard.ts
│   │   └── salesforce-webhook.guard.ts
│   ├── filters/
│   │   ├── http-exception.filter.ts
│   │   └── prisma-exception.filter.ts
│   ├── interceptors/
│   │   ├── logging.interceptor.ts
│   │   └── transform.interceptor.ts
│   ├── pipes/
│   │   └── validation.pipe.ts
│   └── dto/
│       ├── pagination.dto.ts
│       └── api-response.dto.ts
│
├── infrastructure/                  # Servizi condivisi
│   ├── database/
│   │   ├── database.module.ts
│   │   └── prisma.service.ts
│   ├── email/
│   │   ├── email.module.ts
│   │   ├── email.service.ts
│   │   └── templates/
│   ├── pdf/
│   │   ├── pdf.module.ts
│   │   ├── pdf.service.ts
│   │   └── templates/
│   └── salesforce/
│       ├── salesforce.module.ts
│       ├── salesforce.service.ts
│       └── dto/
│
├── slices/
│   ├── auth/
│   ├── catalog/
│   ├── standard-configurator/
│   ├── custom-configurator/
│   ├── orders/
│   └── admin/
│
└── prisma/
    ├── schema.prisma
    ├── seed.ts
    └── migrations/
```

---

## 3. Configurazione

### main.ts

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('B2B LEDWall API')
    .setDescription('API per piattaforma B2B LEDWall Configurator')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Autenticazione e gestione utenti')
    .addTag('Catalog', 'Gestione catalogo prodotti')
    .addTag('Standard', 'Configuratore kit standard')
    .addTag('Custom', 'Configuratore expert')
    .addTag('Orders', 'Gestione ordini')
    .addTag('Admin', 'Pannello amministrazione')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`Application running on: http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/docs`);
}

bootstrap();
```

### app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

// Infrastructure
import { DatabaseModule } from './infrastructure/database/database.module';
import { EmailModule } from './infrastructure/email/email.module';
import { PdfModule } from './infrastructure/pdf/pdf.module';
import { SalesforceModule } from './infrastructure/salesforce/salesforce.module';

// Slices
import { AuthModule } from './slices/auth/auth.module';
import { CatalogModule } from './slices/catalog/catalog.module';
import { StandardConfiguratorModule } from './slices/standard-configurator/standard-configurator.module';
import { CustomConfiguratorModule } from './slices/custom-configurator/custom-configurator.module';
import { OrdersModule } from './slices/orders/orders.module';
import { AdminModule } from './slices/admin/admin.module';

// Guards
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

// Config
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import salesforceConfig from './config/salesforce.config';
import emailConfig from './config/email.config';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, salesforceConfig, emailConfig],
    }),

    // Infrastructure
    DatabaseModule,
    EmailModule,
    PdfModule,
    SalesforceModule,

    // Feature slices
    AuthModule,
    CatalogModule,
    StandardConfiguratorModule,
    CustomConfiguratorModule,
    OrdersModule,
    AdminModule,
  ],
  providers: [
    // JWT Guard globale (usa @Public() per endpoint pubblici)
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
```

### Environment Variables (.env)

```env
# App
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/ledwall_b2b?schema=public"

# JWT
JWT_ACCESS_SECRET=your_super_secret_access_key_change_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_in_production
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback

# Salesforce
SALESFORCE_LOGIN_URL=https://login.salesforce.com
SALESFORCE_CLIENT_ID=your_sf_client_id
SALESFORCE_CLIENT_SECRET=your_sf_client_secret
SALESFORCE_USERNAME=integration@company.com
SALESFORCE_PASSWORD=sf_password
SALESFORCE_SECURITY_TOKEN=sf_security_token
SALESFORCE_WEBHOOK_SECRET=webhook_secret_for_validation

# Email (Google SMTP Relay)
SMTP_HOST=smtp-relay.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@company.com
SMTP_PASSWORD=smtp_password
SMTP_FROM="LEDWall B2B <noreply@company.com>"

# PDF
PDF_OUTPUT_DIR=./storage/pdfs
```

---

## 4. Schema Database (Prisma)

### schema.prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// ENUMS
// ============================================

enum UserRole {
  ADMIN
  PARTNER
}

enum OrderType {
  STANDARD
  CUSTOM
}

enum StandardOrderStatus {
  PREVENTIVATO
  CONFERMATO
  IN_SPEDIZIONE
  IN_INSTALLAZIONE
  CONSEGNATO
  COLLAUDO
}

enum CustomOrderStatus {
  RICHIESTA_RICEVUTA
  VALUTAZIONE_TECNICA
  PREVENTIVAZIONE
  PRODUZIONE
  SPEDIZIONE
  INSTALLAZIONE
}

enum ConfigurationStatus {
  DRAFT
  SUBMITTED
  APPROVED
  REJECTED
}

// === SALESFORCE ENUMS (Picklist values) ===

/// Fase della quotazione (SF: Fase__c)
enum QuotationPhase {
  RICHIESTA_RICEVUTA
  VALUTAZIONE_TECNICA
  PREVENTIVO_INVIATO
  IN_ATTESA_CONFERMA
  CONFERMATO
  ANNULLATO
}

/// Connessione internet disponibile (SF: Connessione_Internet__c)
enum InternetConnection {
  FIBRA
  ADSL
  MOBILE_4G_5G
  NESSUNA
  DA_VERIFICARE
}

/// Gestione contenuti (SF: Gestione_Contenuti__c)
enum ContentManagement {
  DAL_CLIENTE
  DA_NOI
  MISTO
  DA_DEFINIRE
}

/// Sistema ancoraggio (SF: Sistema_Ancoraggio__c)
enum AnchoringSystem {
  A_PARETE
  A_SOFFITTO
  A_PAVIMENTO
  SU_STRUTTURA
  DA_DEFINIRE
}

/// Materiale sito installazione (SF: Materiale_Sito_Installazione__c)
enum AnchoringMaterial {
  CEMENTO
  CARTONGESSO
  LEGNO
  METALLO
  VETRO
  ALTRO
  DA_VERIFICARE
}

/// Tipologia contenuti (SF: Tipologia_di_Contenuti__c)
enum ContentType {
  VIDEO
  IMMAGINI_STATICHE
  TESTO_DINAMICO
  MISTO
  DA_DEFINIRE
}

// ============================================
// AUTH SLICE
// ============================================

/// Utente della piattaforma.
/// I PARTNER vengono sincronizzati da Salesforce (oggetto Partner B2B).
/// Gli ADMIN accedono via Google OAuth.
model User {
  id            String    @id @default(cuid())

  // === Credenziali ===
  email         String    @unique          // SF: UserPiatt__c (username)
  passwordHash  String?                     // SF: PwdPiatt__c (hashed bcrypt)
  googleId      String?   @unique          // Solo per ADMIN (OAuth)

  // === Salesforce Mapping ===
  salesforcePartnerId   String?   @unique  // ID record Partner B2B in SF
  salesforceAccountId   String?            // SF: Partner__c (lookup Account)

  // === Anagrafica ===
  firstName     String
  lastName      String
  companyName   String?                     // Denominazione azienda partner
  phone         String?

  // === Email multiple (da SF) ===
  orderEmail    String?                     // SF: EmailOrdine__c - Notifiche ordini
  billingEmail  String?                     // SF: EmailAmm__c - Fatture

  // === Stato e Ruolo ===
  role          UserRole  @default(PARTNER)
  isActive      Boolean   @default(true)   // SF: AuthPiatt__c

  // === Relations ===
  orders              Order[]
  quotations          Quotation[]          // Preventivi custom
  refreshTokens       RefreshToken[]

  // === Timestamps ===
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLoginAt   DateTime?
  lastSyncAt    DateTime?                   // Ultimo sync da SF

  @@index([email])
  @@index([salesforcePartnerId])
  @@index([salesforceAccountId])
  @@index([role])
  @@index([isActive])
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([token])
}

// ============================================
// CATALOG SLICE
// ============================================

model ProductCategory {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  description String?
  parentId    String?
  parent      ProductCategory?  @relation("CategoryTree", fields: [parentId], references: [id])
  children    ProductCategory[] @relation("CategoryTree")
  products    Product[]

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Product {
  id          String    @id @default(cuid())
  name        String
  sku         String    @unique
  description String?
  categoryId  String
  category    ProductCategory @relation(fields: [categoryId], references: [id])

  // Pricing (in centesimi per evitare floating point)
  priceInCents Int

  // Technical specs (JSON per flessibilità)
  specs       Json?

  isActive    Boolean   @default(true)

  // Relations
  modules     Module[]

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?

  @@index([sku])
  @@index([categoryId])
  @@index([isActive])
}

model Module {
  id          String    @id @default(cuid())
  productId   String
  product     Product   @relation(fields: [productId], references: [id])

  name        String

  // Dimensioni in millimetri
  widthMm     Int
  heightMm    Int

  // Pixel pitch in decimi di mm (25 = 2.5mm)
  pixelPitchTenths Int

  // Specifiche
  resolutionX Int       // pixel
  resolutionY Int       // pixel
  weightGrams Int       // grammi
  powerWatts  Int       // watt

  // Prezzo in centesimi
  priceInCents Int

  isActive    Boolean   @default(true)

  // Relations
  kitModules          KitModule[]
  quotationItems      QuotationItem[]

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([productId])
  @@index([pixelPitchTenths])
  @@index([isActive])
}

model ReceivingCard {
  id          String    @id @default(cuid())
  name        String
  maxPixels   Int       // Massimo numero di pixel supportati
  priceInCents Int
  isActive    Boolean   @default(true)

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

// ============================================
// STANDARD CONFIGURATOR SLICE
// ============================================

model Kit {
  id          String    @id @default(cuid())
  name        String
  description String?

  // Dimensioni totali in millimetri
  widthMm     Int
  heightMm    Int

  // Pixel pitch in decimi di mm
  pixelPitchTenths Int

  // Risoluzione totale
  resolutionX Int
  resolutionY Int

  // Prezzo in centesimi
  priceInCents Int

  // Stato
  isActive    Boolean   @default(true)
  isFeatured  Boolean   @default(false)

  // Relations
  modules     KitModule[]
  orders      Order[]

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?

  @@index([isActive])
  @@index([pixelPitchTenths])
}

model KitModule {
  id        String  @id @default(cuid())
  kitId     String
  kit       Kit     @relation(fields: [kitId], references: [id], onDelete: Cascade)
  moduleId  String
  module    Module  @relation(fields: [moduleId], references: [id])
  quantity  Int

  @@unique([kitId, moduleId])
}

// ============================================
// CUSTOM CONFIGURATOR SLICE (Quotazioni SF)
// ============================================

/// Quotazione/Preventivo custom - Mappa l'oggetto Quotazione di Salesforce.
/// Contiene sia i dati tecnici della configurazione che i dati cliente da SF.
model Quotation {
  id                    String              @id @default(cuid())

  // === Owner/Partner ===
  userId                String
  user                  User                @relation(fields: [userId], references: [id])

  // === Salesforce Mapping ===
  salesforceQuoteNumber String?   @unique  // SF: Name (auto-number Q-XXXXX)
  salesforceQuoteId     String?   @unique  // ID record Quotazione in SF

  // === Progetto (SF fields visibili) ===
  projectName           String?             // SF: Nome_Progetto__c
  customerBudgetCents   Int?                // SF: Budget_Cliente__c (×100)
  installationCity      String?             // SF: Luogo_di_Installazione__c
  requestedDeliveryDate DateTime?           // SF: Data_Richiesta__c

  // === Stato ===
  phase                 QuotationPhase      @default(RICHIESTA_RICEVUTA) // SF: Fase__c
  status                ConfigurationStatus @default(DRAFT)              // Status interno

  // === Info Installazione (SF picklists) ===
  internetConnection    InternetConnection? // SF: Connessione_Internet__c
  contentType           ContentType?        // SF: Tipologia_di_Contenuti__c
  contentManagement     ContentManagement?  // SF: Gestione_Contenuti__c
  anchoringSystem       AnchoringSystem?    // SF: Sistema_Ancoraggio__c
  anchoringMaterial     AnchoringMaterial?  // SF: Materiale_Sito_Installazione__c

  // === Info Cliente ===
  customerCategory      String?             // SF: Categoria_merceologica_cliente__c
  hasExistingSoftware   Boolean @default(false) // SF: Software_Cliente__c
  needsVideorender      Boolean @default(false) // SF: Videorender__c

  // === Note ===
  productsDescription   String?             // SF: Prodotti_da_quotare__c (Rich Text)
  commercialNotes       String?             // SF: Note_Commerciale__c
  ytecNotes             String?             // SF: Note_Riservato_a_YTEC__c (READ-ONLY)

  // === Flag interni (nascosti ma previsti) ===
  needsSiteSurvey       Boolean @default(false) // SF: Sopralluogo_Tecnico__c

  // === Configurazione Tecnica LEDWall ===
  // Dimensioni richieste in millimetri
  requestedWidthMm      Int?
  requestedHeightMm     Int?

  // Pixel pitch selezionato (decimi di mm, es: 25 = 2.5mm)
  pixelPitchTenths      Int?

  // Risultati calcolo algoritmo (popolati dopo configurazione)
  totalModules          Int?
  modulesX              Int?
  modulesY              Int?
  actualWidthMm         Int?
  actualHeightMm        Int?
  resolutionX           Int?
  resolutionY           Int?
  receivingCards        Int?

  // === Pricing ===
  estimatedPriceInCents Int?                // Stima calcolata
  totalCostCents        Int?                // SF: Totale_Costi__c (da rollup)

  // === Relations ===
  items                 QuotationItem[]
  order                 Order?

  // === Timestamps ===
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
  submittedAt           DateTime?           // Quando inviata a SF
  lastSyncAt            DateTime?           // Ultimo sync con SF

  @@index([userId])
  @@index([status])
  @@index([phase])
  @@index([salesforceQuoteId])
  @@index([salesforceQuoteNumber])
}

/// Riga prodotto nella quotazione (modulo selezionato)
model QuotationItem {
  id              String     @id @default(cuid())
  quotationId     String
  quotation       Quotation  @relation(fields: [quotationId], references: [id], onDelete: Cascade)
  moduleId        String
  module          Module     @relation(fields: [moduleId], references: [id])
  quantity        Int
  unitPriceCents  Int?       // Prezzo unitario al momento della quotazione

  @@unique([quotationId, moduleId])
  @@index([quotationId])
}

// ============================================
// ORDERS SLICE
// ============================================

model Order {
  id              String    @id @default(cuid())
  orderNumber     String    @unique

  userId          String
  user            User      @relation(fields: [userId], references: [id])

  type            OrderType

  // Status (JSON per supportare entrambi i workflow)
  // Per STANDARD: StandardOrderStatus
  // Per CUSTOM: CustomOrderStatus
  status          String

  // Totale in centesimi
  totalPriceInCents Int

  // Customer info (snapshot al momento dell'ordine)
  customerInfo    Json

  // Relazioni con configurazione
  kitId           String?
  kit             Kit?      @relation(fields: [kitId], references: [id])
  kitQuantity     Int?

  quotationId           String? @unique
  quotation             Quotation? @relation(fields: [quotationId], references: [id])

  // Salesforce
  salesforceLeadId        String?
  salesforceOpportunityId String? @unique

  // Quote/Preventivo
  quotePdfUrl     String?
  quoteValidUntil DateTime?

  // Tracking
  statusHistory   OrderStatusHistory[]

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([userId])
  @@index([type])
  @@index([status])
  @@index([orderNumber])
  @@index([salesforceOpportunityId])
}

model OrderStatusHistory {
  id        String   @id @default(cuid())
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)

  status    String
  notes     String?
  metadata  Json?    // Es: { trackingNumber, carrier }

  createdBy String?  // User ID o "SYSTEM" o "SALESFORCE"

  createdAt DateTime @default(now())

  @@index([orderId])
  @@index([createdAt])
}

// ============================================
// ADMIN SLICE
// ============================================

model SystemConfig {
  id          String    @id @default(cuid())
  key         String    @unique
  value       Json
  description String?

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model AuditLog {
  id          String    @id @default(cuid())
  userId      String?
  action      String    // CREATE, UPDATE, DELETE
  entity      String    // User, Product, Order, etc.
  entityId    String?
  changes     Json?
  ipAddress   String?
  userAgent   String?

  createdAt   DateTime  @default(now())

  @@index([userId])
  @@index([entity, entityId])
  @@index([createdAt])
}

model WebhookLog {
  id          String    @id @default(cuid())
  source      String    // SALESFORCE
  payload     Json
  status      String    // SUCCESS, FAILED
  error       String?
  processedAt DateTime?

  createdAt   DateTime  @default(now())

  @@index([source])
  @@index([status])
  @@index([createdAt])
}
```

### seed.ts

```typescript
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Categorie
  const categoryIndoor = await prisma.productCategory.upsert({
    where: { slug: 'indoor' },
    update: {},
    create: {
      name: 'Indoor',
      slug: 'indoor',
      description: 'LEDWall per ambienti interni',
    },
  });

  const categoryOutdoor = await prisma.productCategory.upsert({
    where: { slug: 'outdoor' },
    update: {},
    create: {
      name: 'Outdoor',
      slug: 'outdoor',
      description: 'LEDWall per ambienti esterni',
    },
  });

  // Prodotto Indoor
  const productIndoor = await prisma.product.upsert({
    where: { sku: 'LEDW-IND-001' },
    update: {},
    create: {
      name: 'LEDWall Indoor Series',
      sku: 'LEDW-IND-001',
      description: 'Serie di moduli LED per installazioni indoor',
      categoryId: categoryIndoor.id,
      priceInCents: 0, // Prezzo dipende da moduli
      specs: {
        environment: 'indoor',
        brightness: 1000,
        refreshRate: 3840,
      },
    },
  });

  // Moduli P2.5
  await prisma.module.upsert({
    where: { id: 'mod-p25-500' },
    update: {},
    create: {
      id: 'mod-p25-500',
      productId: productIndoor.id,
      name: 'Modulo P2.5 500x500mm',
      widthMm: 500,
      heightMm: 500,
      pixelPitchTenths: 25, // 2.5mm
      resolutionX: 200,
      resolutionY: 200,
      weightGrams: 8500,
      powerWatts: 120,
      priceInCents: 35000, // 350.00 EUR
    },
  });

  // Moduli P3.91
  await prisma.module.upsert({
    where: { id: 'mod-p391-500' },
    update: {},
    create: {
      id: 'mod-p391-500',
      productId: productIndoor.id,
      name: 'Modulo P3.91 500x500mm',
      widthMm: 500,
      heightMm: 500,
      pixelPitchTenths: 39, // 3.91mm
      resolutionX: 128,
      resolutionY: 128,
      weightGrams: 7500,
      powerWatts: 100,
      priceInCents: 28000, // 280.00 EUR
    },
  });

  // Receiving Card
  await prisma.receivingCard.upsert({
    where: { id: 'rc-001' },
    update: {},
    create: {
      id: 'rc-001',
      name: 'Receiving Card Standard',
      maxPixels: 650000,
      priceInCents: 5000, // 50.00 EUR
    },
  });

  // Kit Standard
  const kitStandard = await prisma.kit.upsert({
    where: { id: 'kit-std-2x1-p25' },
    update: {},
    create: {
      id: 'kit-std-2x1-p25',
      name: 'Kit Indoor 2x1m P2.5',
      description: 'Kit pre-configurato per LEDWall indoor 2x1 metri',
      widthMm: 2000,
      heightMm: 1000,
      pixelPitchTenths: 25,
      resolutionX: 800,
      resolutionY: 400,
      priceInCents: 1500000, // 15.000 EUR
      isActive: true,
      isFeatured: true,
    },
  });

  // Kit modules
  await prisma.kitModule.upsert({
    where: { id: 'km-001' },
    update: {},
    create: {
      id: 'km-001',
      kitId: kitStandard.id,
      moduleId: 'mod-p25-500',
      quantity: 8, // 4x2 moduli
    },
  });

  // System Config
  await prisma.systemConfig.upsert({
    where: { key: 'MAX_RECEIVING_CARD_PIXELS' },
    update: {},
    create: {
      key: 'MAX_RECEIVING_CARD_PIXELS',
      value: 650000,
      description: 'Numero massimo di pixel per receiving card',
    },
  });

  // Admin user (per test)
  await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      firstName: 'Admin',
      lastName: 'Test',
      role: UserRole.ADMIN,
      googleId: 'test-google-id',
    },
  });

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## 5. Slice: Auth

### auth.module.ts

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRepository } from './repositories/user.repository';

import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';

import { SalesforceModule } from '../../infrastructure/salesforce/salesforce.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_ACCESS_EXPIRATION', '15m'),
        },
      }),
      inject: [ConfigService],
    }),
    SalesforceModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, UserRepository, JwtStrategy, GoogleStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

### auth.controller.ts

```typescript
import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Response, Request } from 'express';

import { AuthService } from './auth.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UserResponseDto } from './dto/user-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login con credenziali Salesforce' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh JWT tokens' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async refresh(@Body() dto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Inizia OAuth Google (redirect)' })
  async googleAuth() {
    // Guard handles redirect
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Callback OAuth Google' })
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.googleLogin(req.user);

    // Redirect al frontend con tokens
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const params = new URLSearchParams({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });

    res.redirect(`${frontendUrl}/auth/callback?${params.toString()}`);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ottieni info utente corrente' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async me(@CurrentUser() user: any): Promise<UserResponseDto> {
    return this.authService.getUser(user.id);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout (invalida refresh token)' })
  async logout(
    @CurrentUser() user: any,
    @Body() dto: RefreshTokenDto,
  ): Promise<void> {
    await this.authService.logout(user.id, dto.refreshToken);
  }
}
```

### auth.service.ts

```typescript
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@prisma/client';

import { UserRepository } from './repositories/user.repository';
import { SalesforceService } from '../../infrastructure/salesforce/salesforce.service';

import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly salesforceService: SalesforceService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    // 1. Valida su Salesforce
    const sfUser = await this.salesforceService.authenticateUser(
      dto.email,
      dto.password,
    );

    if (!sfUser) {
      throw new UnauthorizedException('Credenziali non valide');
    }

    // 2. Trova o crea utente locale
    let user = await this.userRepository.findBySalesforceId(sfUser.id);

    if (!user) {
      user = await this.userRepository.create({
        email: sfUser.email,
        salesforceId: sfUser.id,
        firstName: sfUser.firstName,
        lastName: sfUser.lastName,
        companyName: sfUser.companyName,
        role: UserRole.PARTNER,
      });
    } else if (!user.isActive) {
      throw new UnauthorizedException('Account disattivato');
    }

    // 3. Genera tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    // 4. Salva refresh token
    await this.userRepository.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.mapToUserResponse(user),
    };
  }

  async googleLogin(googleProfile: any): Promise<AuthResponseDto> {
    let user = await this.userRepository.findByEmail(googleProfile.email);

    if (!user) {
      // Nuovo utente Google = ADMIN
      user = await this.userRepository.create({
        email: googleProfile.email,
        googleId: googleProfile.id,
        firstName: googleProfile.firstName,
        lastName: googleProfile.lastName,
        role: UserRole.ADMIN,
      });
    } else {
      // Utente esistente: aggiorna googleId se mancante e promuovi a ADMIN
      if (!user.googleId || user.role !== UserRole.ADMIN) {
        user = await this.userRepository.update(user.id, {
          googleId: googleProfile.id,
          role: UserRole.ADMIN,
        });
      }
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.userRepository.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.mapToUserResponse(user),
    };
  }

  async refreshTokens(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      // Verifica che il token sia valido nel DB
      const storedToken = await this.userRepository.findRefreshToken(refreshToken);
      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Token scaduto');
      }

      const user = await this.userRepository.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Utente non trovato');
      }

      // Invalida vecchio token e genera nuovi
      await this.userRepository.deleteRefreshToken(refreshToken);

      const tokens = await this.generateTokens(user.id, user.email, user.role);
      await this.userRepository.saveRefreshToken(user.id, tokens.refreshToken);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: this.mapToUserResponse(user),
      };
    } catch (error) {
      throw new UnauthorizedException('Token non valido');
    }
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    await this.userRepository.deleteRefreshToken(refreshToken);
  }

  async getUser(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Utente non trovato');
    }
    return this.mapToUserResponse(user);
  }

  async validateUser(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.isActive) {
      return null;
    }
    return user;
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: UserRole,
  ) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get('JWT_ACCESS_EXPIRATION', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '7d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private mapToUserResponse(user: any): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      companyName: user.companyName,
      role: user.role,
    };
  }
}
```

### DTOs

```typescript
// dto/login.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'partner@company.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;
}

// dto/refresh-token.dto.ts
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

// dto/auth-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto';

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
}

// dto/user-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ required: false })
  companyName?: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;
}
```

---

## 6. Slice: Catalog

### API Endpoints

| Method | Endpoint | Descrizione | Auth | Ruolo |
|--------|----------|-------------|------|-------|
| GET | `/catalog/categories` | Lista categorie | JWT | All |
| GET | `/catalog/products` | Lista prodotti con filtri | JWT | All |
| GET | `/catalog/products/:id` | Dettaglio prodotto | JWT | All |
| POST | `/catalog/products` | Crea prodotto | JWT | ADMIN |
| PUT | `/catalog/products/:id` | Aggiorna prodotto | JWT | ADMIN |
| DELETE | `/catalog/products/:id` | Elimina prodotto (soft) | JWT | ADMIN |
| GET | `/catalog/modules` | Lista moduli | JWT | All |
| GET | `/catalog/modules/by-pitch/:pitch` | Moduli per pitch | JWT | All |
| GET | `/catalog/receiving-cards` | Lista receiving cards | JWT | All |

### catalog.controller.ts

```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

import { CatalogService } from './catalog.service';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { ModuleResponseDto } from './dto/module-response.dto';
import { CategoryResponseDto } from './dto/category-response.dto';

@ApiTags('Catalog')
@ApiBearerAuth()
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  // ==================== CATEGORIES ====================

  @Get('categories')
  @ApiOperation({ summary: 'Lista tutte le categorie' })
  @ApiResponse({ status: 200, type: [CategoryResponseDto] })
  async getCategories(): Promise<CategoryResponseDto[]> {
    return this.catalogService.getCategories();
  }

  // ==================== PRODUCTS ====================

  @Get('products')
  @ApiOperation({ summary: 'Lista prodotti con filtri' })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiResponse({ status: 200, type: [ProductResponseDto] })
  async getProducts(
    @Query() filters: ProductFilterDto,
  ): Promise<{ data: ProductResponseDto[]; total: number }> {
    return this.catalogService.getProducts(filters);
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Dettaglio prodotto' })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  async getProduct(@Param('id') id: string): Promise<ProductResponseDto> {
    return this.catalogService.getProductById(id);
  }

  @Post('products')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crea prodotto (Admin)' })
  @ApiResponse({ status: 201, type: ProductResponseDto })
  async createProduct(
    @Body() dto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    return this.catalogService.createProduct(dto);
  }

  @Put('products/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Aggiorna prodotto (Admin)' })
  @ApiResponse({ status: 200, type: ProductResponseDto })
  async updateProduct(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.catalogService.updateProduct(id, dto);
  }

  @Delete('products/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Elimina prodotto (Admin, soft delete)' })
  async deleteProduct(@Param('id') id: string): Promise<void> {
    await this.catalogService.deleteProduct(id);
  }

  // ==================== MODULES ====================

  @Get('modules')
  @ApiOperation({ summary: 'Lista tutti i moduli attivi' })
  @ApiQuery({ name: 'productId', required: false })
  @ApiResponse({ status: 200, type: [ModuleResponseDto] })
  async getModules(
    @Query('productId') productId?: string,
  ): Promise<ModuleResponseDto[]> {
    return this.catalogService.getModules(productId);
  }

  @Get('modules/by-pitch/:pitch')
  @ApiOperation({ summary: 'Moduli per pixel pitch (decimi mm)' })
  @ApiResponse({ status: 200, type: [ModuleResponseDto] })
  async getModulesByPitch(
    @Param('pitch') pitch: number,
  ): Promise<ModuleResponseDto[]> {
    return this.catalogService.getModulesByPitch(pitch);
  }

  @Get('pixel-pitches')
  @ApiOperation({ summary: 'Lista pixel pitch disponibili' })
  async getAvailablePixelPitches(): Promise<number[]> {
    return this.catalogService.getAvailablePixelPitches();
  }

  // ==================== RECEIVING CARDS ====================

  @Get('receiving-cards')
  @ApiOperation({ summary: 'Lista receiving cards' })
  async getReceivingCards() {
    return this.catalogService.getReceivingCards();
  }
}
```

### catalog.service.ts

```typescript
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { ProductRepository } from './repositories/product.repository';
import { ModuleRepository } from './repositories/module.repository';
import { CategoryRepository } from './repositories/category.repository';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';

@Injectable()
export class CatalogService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly moduleRepository: ModuleRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  // ==================== CATEGORIES ====================

  async getCategories() {
    return this.categoryRepository.findAll();
  }

  // ==================== PRODUCTS ====================

  async getProducts(filters: ProductFilterDto) {
    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
    };

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { sku: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const [data, total] = await Promise.all([
      this.productRepository.findMany({
        where,
        include: {
          category: true,
          modules: true,
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.productRepository.count({ where }),
    ]);

    return {
      data: data.map(this.mapProductToResponse),
      total,
    };
  }

  async getProductById(id: string) {
    const product = await this.productRepository.findUnique({
      where: { id },
      include: {
        category: true,
        modules: true,
      },
    });

    if (!product || product.deletedAt) {
      throw new NotFoundException('Prodotto non trovato');
    }

    return this.mapProductToResponse(product);
  }

  async createProduct(dto: CreateProductDto) {
    // Verifica SKU unico
    const existing = await this.productRepository.findBySku(dto.sku);
    if (existing) {
      throw new ConflictException(`SKU ${dto.sku} già esistente`);
    }

    const product = await this.productRepository.create({
      data: {
        name: dto.name,
        sku: dto.sku,
        description: dto.description,
        categoryId: dto.categoryId,
        priceInCents: dto.priceInCents,
        specs: dto.specs,
        isActive: dto.isActive ?? true,
      },
      include: {
        category: true,
        modules: true,
      },
    });

    return this.mapProductToResponse(product);
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    await this.getProductById(id); // Verifica esistenza

    if (dto.sku) {
      const existing = await this.productRepository.findBySku(dto.sku);
      if (existing && existing.id !== id) {
        throw new ConflictException(`SKU ${dto.sku} già esistente`);
      }
    }

    const product = await this.productRepository.update({
      where: { id },
      data: dto,
      include: {
        category: true,
        modules: true,
      },
    });

    return this.mapProductToResponse(product);
  }

  async deleteProduct(id: string) {
    await this.getProductById(id);
    await this.productRepository.softDelete(id);
  }

  // ==================== MODULES ====================

  async getModules(productId?: string) {
    const where: Prisma.ModuleWhereInput = {
      isActive: true,
    };

    if (productId) {
      where.productId = productId;
    }

    const modules = await this.moduleRepository.findMany({
      where,
      include: { product: true },
      orderBy: [{ pixelPitchTenths: 'asc' }, { name: 'asc' }],
    });

    return modules.map(this.mapModuleToResponse);
  }

  async getModulesByPitch(pitchTenths: number) {
    const modules = await this.moduleRepository.findMany({
      where: {
        pixelPitchTenths: pitchTenths,
        isActive: true,
      },
      include: { product: true },
      orderBy: { name: 'asc' },
    });

    return modules.map(this.mapModuleToResponse);
  }

  async getAvailablePixelPitches(): Promise<number[]> {
    return this.moduleRepository.getDistinctPitches();
  }

  // ==================== RECEIVING CARDS ====================

  async getReceivingCards() {
    const cards = await this.productRepository.findReceivingCards();
    return cards.map((card) => ({
      id: card.id,
      name: card.name,
      maxPixels: card.maxPixels,
      price: card.priceInCents / 100,
    }));
  }

  // ==================== MAPPERS ====================

  private mapProductToResponse(product: any) {
    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      description: product.description,
      category: product.category
        ? {
            id: product.category.id,
            name: product.category.name,
            slug: product.category.slug,
          }
        : null,
      price: product.priceInCents / 100,
      specs: product.specs,
      isActive: product.isActive,
      modulesCount: product.modules?.length || 0,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  private mapModuleToResponse(module: any) {
    return {
      id: module.id,
      name: module.name,
      productId: module.productId,
      productName: module.product?.name,
      dimensions: {
        widthMm: module.widthMm,
        heightMm: module.heightMm,
      },
      pixelPitch: module.pixelPitchTenths / 10, // Converti in mm
      resolution: {
        x: module.resolutionX,
        y: module.resolutionY,
      },
      weightKg: module.weightGrams / 1000,
      powerWatts: module.powerWatts,
      price: module.priceInCents / 100,
    };
  }
}
```

---

## 7. Slice: Standard Configurator

### API Endpoints

| Method | Endpoint | Descrizione | Auth | Ruolo |
|--------|----------|-------------|------|-------|
| GET | `/standard/kits` | Lista kit disponibili | JWT | All |
| GET | `/standard/kits/:id` | Dettaglio kit | JWT | All |
| POST | `/standard/kits` | Crea kit | JWT | ADMIN |
| PUT | `/standard/kits/:id` | Aggiorna kit | JWT | ADMIN |
| DELETE | `/standard/kits/:id` | Elimina kit | JWT | ADMIN |
| POST | `/standard/generate-quote` | Genera preventivo PDF | JWT | All |
| POST | `/standard/confirm-order` | Conferma ordine | JWT | PARTNER |

### standard-configurator.service.ts (estratto)

```typescript
@Injectable()
export class StandardConfiguratorService {
  constructor(
    private readonly kitRepository: KitRepository,
    private readonly orderRepository: OrderRepository,
    private readonly pdfService: PdfService,
    private readonly emailService: EmailService,
    private readonly salesforceService: SalesforceService,
  ) {}

  async generateQuote(dto: GenerateQuoteDto, user: any) {
    const kit = await this.kitRepository.findById(dto.kitId);
    if (!kit || !kit.isActive) {
      throw new NotFoundException('Kit non trovato');
    }

    const totalPrice = (kit.priceInCents * dto.quantity) / 100;
    const quoteNumber = this.generateQuoteNumber();
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30); // Valido 30 giorni

    const quoteData = {
      quoteNumber,
      type: 'STANDARD',
      customer: dto.customerInfo,
      kit: {
        id: kit.id,
        name: kit.name,
        dimensions: {
          widthMm: kit.widthMm,
          heightMm: kit.heightMm,
        },
        pixelPitch: kit.pixelPitchTenths / 10,
        resolution: {
          x: kit.resolutionX,
          y: kit.resolutionY,
        },
        unitPrice: kit.priceInCents / 100,
      },
      quantity: dto.quantity,
      totalPrice,
      validUntil,
      generatedAt: new Date(),
      generatedBy: `${user.firstName} ${user.lastName}`,
    };

    // Genera PDF
    const pdfPath = await this.pdfService.generateStandardQuote(quoteData);
    const pdfUrl = `/storage/pdfs/${path.basename(pdfPath)}`;

    // Salva order in stato PREVENTIVATO
    const order = await this.orderRepository.create({
      orderNumber: quoteNumber,
      userId: user.id,
      type: OrderType.STANDARD,
      status: 'PREVENTIVATO',
      totalPriceInCents: totalPrice * 100,
      customerInfo: dto.customerInfo,
      kitId: kit.id,
      kitQuantity: dto.quantity,
      quotePdfUrl: pdfUrl,
      quoteValidUntil: validUntil,
    });

    // Invia email con PDF
    await this.emailService.sendQuoteGenerated(
      dto.customerInfo.email,
      quoteData,
      pdfPath,
    );

    return {
      orderId: order.id,
      quoteNumber,
      pdfUrl,
      totalPrice,
      validUntil,
    };
  }

  async confirmOrder(orderId: string, user: any) {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException('Ordine non trovato');
    }

    if (order.userId !== user.id) {
      throw new ForbiddenException('Non autorizzato');
    }

    if (order.status !== 'PREVENTIVATO') {
      throw new BadRequestException('Ordine già confermato');
    }

    // Crea Opportunity su Salesforce
    const sfOpportunityId = await this.salesforceService.createOpportunity({
      name: `LEDWall Standard - ${order.orderNumber}`,
      amount: order.totalPriceInCents / 100,
      stage: 'Closed Won',
      type: 'Standard',
      closeDate: new Date(),
      description: `Kit: ${order.kit.name}, Quantità: ${order.kitQuantity}`,
      configurationData: {
        kitId: order.kitId,
        quantity: order.kitQuantity,
      },
    });

    // Aggiorna ordine locale
    await this.orderRepository.update(orderId, {
      status: 'CONFERMATO',
      salesforceOpportunityId: sfOpportunityId,
    });

    // Aggiungi a status history
    await this.orderRepository.addStatusHistory(orderId, {
      status: 'CONFERMATO',
      notes: 'Ordine confermato dal cliente',
      createdBy: user.id,
    });

    // Invia email conferma
    await this.emailService.sendOrderStatusChanged(
      order.customerInfo.email,
      {
        orderNumber: order.orderNumber,
        status: 'CONFERMATO',
        message: 'Il tuo ordine è stato confermato e verrà processato.',
      },
    );

    return {
      orderId,
      status: 'CONFERMATO',
      salesforceOpportunityId: sfOpportunityId,
    };
  }

  private generateQuoteNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `QT-${year}-${random}`;
  }
}
```

---

## 8. Slice: Custom Configurator

### API Endpoints

| Method | Endpoint | Descrizione | Auth | Ruolo |
|--------|----------|-------------|------|-------|
| POST | `/custom/check-compatibility` | Verifica compatibilità | JWT | All |
| POST | `/custom/calculate` | Calcola configurazione | JWT | All |
| POST | `/custom/submit-request` | Invia richiesta custom | JWT | PARTNER |
| GET | `/custom/configurations` | Lista config utente | JWT | All |
| GET | `/custom/configurations/:id` | Dettaglio config | JWT | All |
| DELETE | `/custom/configurations/:id` | Elimina bozza | JWT | All |

### Algoritmo di Compatibilità

```typescript
// custom-configurator/engines/compatibility.engine.ts

export interface CompatibilityInput {
  requestedWidthMm: number;
  requestedHeightMm: number;
  pixelPitchTenths: number;
}

export interface CompatibleModule {
  moduleId: string;
  moduleName: string;
  moduleDimensions: { widthMm: number; heightMm: number };
  configuration: {
    modulesX: number;
    modulesY: number;
    totalModules: number;
    actualWidthMm: number;
    actualHeightMm: number;
    resolutionX: number;
    resolutionY: number;
    fitQuality: 'EXACT' | 'CLOSE' | 'APPROXIMATE';
    wastedAreaPercent: number;
  };
}

export interface CompatibilityResult {
  compatible: boolean;
  suggestions: CompatibleModule[];
  errors: string[];
}

@Injectable()
export class CompatibilityEngine {
  constructor(private readonly moduleRepository: ModuleRepository) {}

  async checkCompatibility(input: CompatibilityInput): Promise<CompatibilityResult> {
    const errors: string[] = [];

    // Validazioni base
    if (input.requestedWidthMm < 500) {
      errors.push('Larghezza minima: 500mm');
    }
    if (input.requestedHeightMm < 500) {
      errors.push('Altezza minima: 500mm');
    }
    if (input.requestedWidthMm > 50000) {
      errors.push('Larghezza massima: 50000mm');
    }
    if (input.requestedHeightMm > 50000) {
      errors.push('Altezza massima: 50000mm');
    }

    if (errors.length > 0) {
      return { compatible: false, suggestions: [], errors };
    }

    // Trova moduli con il pitch richiesto
    const modules = await this.moduleRepository.findMany({
      where: {
        pixelPitchTenths: input.pixelPitchTenths,
        isActive: true,
      },
    });

    if (modules.length === 0) {
      return {
        compatible: false,
        suggestions: [],
        errors: [`Nessun modulo disponibile con pitch ${input.pixelPitchTenths / 10}mm`],
      };
    }

    // Calcola configurazioni per ogni modulo
    const suggestions: CompatibleModule[] = [];

    for (const module of modules) {
      const config = this.calculateConfiguration(
        input.requestedWidthMm,
        input.requestedHeightMm,
        module,
      );

      suggestions.push({
        moduleId: module.id,
        moduleName: module.name,
        moduleDimensions: {
          widthMm: module.widthMm,
          heightMm: module.heightMm,
        },
        configuration: config,
      });
    }

    // Ordina per qualità del fit
    suggestions.sort((a, b) => {
      const qualityOrder = { EXACT: 0, CLOSE: 1, APPROXIMATE: 2 };
      return (
        qualityOrder[a.configuration.fitQuality] -
        qualityOrder[b.configuration.fitQuality]
      );
    });

    return {
      compatible: true,
      suggestions,
      errors: [],
    };
  }

  private calculateConfiguration(
    requestedWidthMm: number,
    requestedHeightMm: number,
    module: any,
  ) {
    // Calcola numero di moduli necessari
    const modulesX = Math.ceil(requestedWidthMm / module.widthMm);
    const modulesY = Math.ceil(requestedHeightMm / module.heightMm);
    const totalModules = modulesX * modulesY;

    // Dimensioni effettive
    const actualWidthMm = modulesX * module.widthMm;
    const actualHeightMm = modulesY * module.heightMm;

    // Risoluzione totale
    const resolutionX = modulesX * module.resolutionX;
    const resolutionY = modulesY * module.resolutionY;

    // Calcola qualità del fit
    const requestedArea = requestedWidthMm * requestedHeightMm;
    const actualArea = actualWidthMm * actualHeightMm;
    const wastedArea = actualArea - requestedArea;
    const wastedAreaPercent = (wastedArea / requestedArea) * 100;

    let fitQuality: 'EXACT' | 'CLOSE' | 'APPROXIMATE';
    if (wastedAreaPercent === 0) {
      fitQuality = 'EXACT';
    } else if (wastedAreaPercent <= 10) {
      fitQuality = 'CLOSE';
    } else {
      fitQuality = 'APPROXIMATE';
    }

    return {
      modulesX,
      modulesY,
      totalModules,
      actualWidthMm,
      actualHeightMm,
      resolutionX,
      resolutionY,
      fitQuality,
      wastedAreaPercent: Math.round(wastedAreaPercent * 100) / 100,
    };
  }
}
```

### Calculation Engine

```typescript
// custom-configurator/engines/calculation.engine.ts

export interface CalculationInput {
  moduleId: string;
  modulesX: number;
  modulesY: number;
}

export interface CalculationResult {
  totalModules: number;
  resolution: { x: number; y: number };
  dimensions: { widthMm: number; heightMm: number };
  receivingCards: number;
  totalWeightKg: number;
  totalPowerWatts: number;
  estimatedPriceEur: number;
  breakdown: {
    modulesPrice: number;
    receivingCardsPrice: number;
    otherCosts: number;
  };
}

@Injectable()
export class CalculationEngine {
  constructor(
    private readonly moduleRepository: ModuleRepository,
    private readonly configService: ConfigService,
  ) {}

  async calculate(input: CalculationInput): Promise<CalculationResult> {
    const module = await this.moduleRepository.findById(input.moduleId);
    if (!module) {
      throw new NotFoundException('Modulo non trovato');
    }

    const totalModules = input.modulesX * input.modulesY;

    // Calcoli base
    const resolution = {
      x: input.modulesX * module.resolutionX,
      y: input.modulesY * module.resolutionY,
    };

    const dimensions = {
      widthMm: input.modulesX * module.widthMm,
      heightMm: input.modulesY * module.heightMm,
    };

    // Receiving cards
    const totalPixels = resolution.x * resolution.y;
    const maxPixelsPerCard = this.configService.get('MAX_RECEIVING_CARD_PIXELS', 650000);
    const receivingCards = Math.ceil(totalPixels / maxPixelsPerCard);

    // Peso e consumo
    const totalWeightKg = (totalModules * module.weightGrams) / 1000;
    const totalPowerWatts = totalModules * module.powerWatts;

    // Prezzi
    const modulesPrice = (totalModules * module.priceInCents) / 100;
    const receivingCardPrice = 50; // EUR - da configurazione
    const receivingCardsPrice = receivingCards * receivingCardPrice;
    const otherCosts = modulesPrice * 0.1; // 10% per accessori/cablaggio
    const estimatedPriceEur = modulesPrice + receivingCardsPrice + otherCosts;

    return {
      totalModules,
      resolution,
      dimensions,
      receivingCards,
      totalWeightKg: Math.round(totalWeightKg * 10) / 10,
      totalPowerWatts,
      estimatedPriceEur: Math.round(estimatedPriceEur),
      breakdown: {
        modulesPrice: Math.round(modulesPrice),
        receivingCardsPrice: Math.round(receivingCardsPrice),
        otherCosts: Math.round(otherCosts),
      },
    };
  }
}
```

---

## 8.1 Quotation Management (Flusso Preventivi SF)

### Flusso Architetturale

```
┌─────────────────────────────────────────────────────────────────┐
│                 FLUSSO QUOTAZIONE (SF-DRIVEN)                   │
└─────────────────────────────────────────────────────────────────┘

Partner           Sito B2B              Backend              Salesforce
   │                  │                    │                     │
   │ 1. Compila form  │                    │                     │
   │─────────────────>│ POST /quotations   │                     │
   │                  │───────────────────>│ Crea DRAFT          │
   │                  │<───────────────────│                     │
   │                  │                    │                     │
   │ 2. Invia a SF    │ POST /:id/submit   │                     │
   │─────────────────>│───────────────────>│ Crea record SF      │
   │                  │                    │────────────────────>│
   │                  │                    │<── SF Quote Number ─│
   │                  │                    │                     │
   │                  │   [QUOTAZIONE DIVENTA READ-ONLY]         │
   │                  │                    │                     │
   │                  │     [SF team completa: pricing, note]    │
   │                  │                    │                     │
   │                  │                    │<── Webhook update ──│
   │                  │                    │ Aggiorna locale     │
   │                  │                    │                     │
   │ 3. Visualizza    │ GET /:id           │                     │
   │   (READ-ONLY)    │<───────────────────│                     │
```

> **📌 Source of Truth**: Dopo l'invio a Salesforce, SF diventa la source of truth.
> Il sito mostra dati in cache, aggiornati via webhook. Il Partner NON può più modificare.

### API Endpoints

| Method | Endpoint | Descrizione | Auth | Ruolo |
|--------|----------|-------------|------|-------|
| POST | `/custom/quotations` | Crea quotazione starter (DRAFT) | JWT | PARTNER |
| GET | `/custom/quotations` | Lista quotazioni utente | JWT | All |
| GET | `/custom/quotations/:id` | Dettaglio quotazione | JWT | All |
| PATCH | `/custom/quotations/:id` | Aggiorna bozza (solo DRAFT) | JWT | PARTNER |
| DELETE | `/custom/quotations/:id` | Elimina bozza (solo DRAFT) | JWT | PARTNER |
| POST | `/custom/quotations/:id/submit` | Invia a Salesforce | JWT | PARTNER |
| POST | `/custom/webhooks/salesforce/quotation` | Webhook aggiornamenti SF | Webhook | - |

### DTOs

```typescript
// quotations/dto/create-quotation.dto.ts

/**
 * DTO per creazione quotazione - Campi editabili dal Partner
 * Questi sono gli UNICI campi che il Partner può impostare
 */
export class CreateQuotationDto {
  // === INFORMAZIONI PROGETTO ===
  @IsString()
  @IsNotEmpty()
  projectName: string; // Nome progetto/evento

  @IsOptional()
  @IsInt()
  @Min(0)
  customerBudgetCents?: number; // Budget cliente in centesimi

  @IsOptional()
  @IsString()
  installationCity?: string; // Città installazione

  @IsOptional()
  @IsDateString()
  requestedDeliveryDate?: string; // Data consegna richiesta

  // === DETTAGLI INSTALLAZIONE (Picklist SF) ===
  @IsOptional()
  @IsEnum(InternetConnection)
  internetConnection?: InternetConnection;

  @IsOptional()
  @IsEnum(ContentType)
  contentType?: ContentType;

  @IsOptional()
  @IsEnum(ContentManagement)
  contentManagement?: ContentManagement;

  @IsOptional()
  @IsEnum(AnchoringSystem)
  anchoringSystem?: AnchoringSystem;

  @IsOptional()
  @IsEnum(AnchoringMaterial)
  anchoringMaterial?: AnchoringMaterial;

  // === INFO CLIENTE ===
  @IsOptional()
  @IsEnum(CustomerCategory)
  customerCategory?: CustomerCategory;

  @IsOptional()
  @IsBoolean()
  hasExistingSoftware?: boolean;

  @IsOptional()
  @IsBoolean()
  needsVideorender?: boolean;

  // === NOTE ===
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  productsDescription?: string; // Descrizione prodotti richiesti

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  commercialNotes?: string; // Note commerciali

  @IsOptional()
  @IsBoolean()
  needsSiteSurvey?: boolean; // Richiede sopralluogo

  // === CONFIGURAZIONE TECNICA (dal configuratore) ===
  @IsInt()
  @Min(500)
  requestedWidthMm: number; // Larghezza richiesta mm

  @IsInt()
  @Min(500)
  requestedHeightMm: number; // Altezza richiesta mm

  @IsInt()
  @Min(10)
  pixelPitchTenths: number; // Pitch (es: 25 = P2.5)

  @IsInt()
  @Min(1)
  totalModules: number; // Numero totale moduli

  @IsInt()
  @Min(1)
  modulesX: number; // Moduli orizzontali

  @IsInt()
  @Min(1)
  modulesY: number; // Moduli verticali

  @IsInt()
  actualWidthMm: number; // Larghezza effettiva mm

  @IsInt()
  actualHeightMm: number; // Altezza effettiva mm

  @IsInt()
  resolutionX: number; // Risoluzione orizzontale px

  @IsInt()
  resolutionY: number; // Risoluzione verticale px

  @IsInt()
  @Min(1)
  receivingCards: number; // Numero receiving cards

  @IsInt()
  @Min(0)
  estimatedPriceInCents: number; // Prezzo stimato (frontend)
}
```

```typescript
// quotations/dto/update-quotation.dto.ts

/**
 * DTO per aggiornamento quotazione - Solo se status è DRAFT
 * Partial di CreateQuotationDto
 */
export class UpdateQuotationDto extends PartialType(CreateQuotationDto) {}
```

```typescript
// quotations/dto/quotation-response.dto.ts

/**
 * DTO Response - Include tutti i campi, anche quelli READ-ONLY da SF
 */
export class QuotationResponseDto {
  id: string;
  userId: string;
  status: QuotationStatus; // DRAFT | SUBMITTED

  // === Campi editabili (da CreateQuotationDto) ===
  projectName: string;
  customerBudgetCents?: number;
  installationCity?: string;
  requestedDeliveryDate?: Date;
  internetConnection?: InternetConnection;
  contentType?: ContentType;
  contentManagement?: ContentManagement;
  anchoringSystem?: AnchoringSystem;
  anchoringMaterial?: AnchoringMaterial;
  customerCategory?: CustomerCategory;
  hasExistingSoftware?: boolean;
  needsVideorender?: boolean;
  productsDescription?: string;
  commercialNotes?: string;
  needsSiteSurvey?: boolean;
  requestedWidthMm: number;
  requestedHeightMm: number;
  pixelPitchTenths: number;
  totalModules: number;
  modulesX: number;
  modulesY: number;
  actualWidthMm: number;
  actualHeightMm: number;
  resolutionX: number;
  resolutionY: number;
  receivingCards: number;
  estimatedPriceInCents: number;

  // === Campi READ-ONLY (popolati da Salesforce) ===
  salesforceQuoteId?: string;      // ID record SF (18 char)
  salesforceQuoteNumber?: string;  // Auto-number SF (Q-XXXXX)
  phase?: QuotationPhase;          // Fase quotazione
  totalCostCents?: number;         // Costo totale (rollup SF)
  ytecNotes?: string;              // Note riservate team interno
  lastSyncAt?: Date;               // Ultimo sync con SF

  // === Metadata ===
  createdAt: Date;
  updatedAt: Date;
}
```

```typescript
// quotations/dto/submit-quotation-response.dto.ts

export class SubmitQuotationResponseDto {
  success: boolean;
  quotationId: string;
  salesforceQuoteId: string;
  salesforceQuoteNumber: string;
  message: string;
}
```

```typescript
// quotations/dto/salesforce-quotation-webhook.dto.ts

/**
 * Payload ricevuto da Salesforce quando una quotazione viene aggiornata
 */
export class SalesforceQuotationWebhookDto {
  @IsString()
  quotationId: string; // ID SF della quotazione

  @IsEnum(QuotationPhase)
  phase: QuotationPhase; // Nuova fase

  @IsOptional()
  @IsInt()
  totalCostCents?: number; // Costo totale aggiornato

  @IsOptional()
  @IsString()
  ytecNotes?: string; // Note interne aggiornate

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>; // Altri campi SF
}
```

### Controller

```typescript
// quotations/quotations.controller.ts

@ApiTags('Quotations')
@Controller('custom/quotations')
@UseGuards(JwtAuthGuard)
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Post()
  @Roles(UserRole.PARTNER)
  @ApiOperation({ summary: 'Crea nuova quotazione (DRAFT)' })
  @ApiResponse({ status: 201, type: QuotationResponseDto })
  async create(
    @CurrentUser() user: User,
    @Body() createDto: CreateQuotationDto,
  ): Promise<QuotationResponseDto> {
    return this.quotationsService.create(user.id, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista quotazioni utente' })
  @ApiResponse({ status: 200, type: [QuotationResponseDto] })
  async findAll(
    @CurrentUser() user: User,
    @Query() filters: QuotationFiltersDto,
  ): Promise<QuotationResponseDto[]> {
    return this.quotationsService.findAllByUser(user.id, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Dettaglio quotazione' })
  @ApiResponse({ status: 200, type: QuotationResponseDto })
  async findOne(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<QuotationResponseDto> {
    return this.quotationsService.findOne(id, user.id);
  }

  @Patch(':id')
  @Roles(UserRole.PARTNER)
  @ApiOperation({ summary: 'Aggiorna quotazione (solo DRAFT)' })
  @ApiResponse({ status: 200, type: QuotationResponseDto })
  async update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() updateDto: UpdateQuotationDto,
  ): Promise<QuotationResponseDto> {
    return this.quotationsService.update(id, user.id, updateDto);
  }

  @Delete(':id')
  @Roles(UserRole.PARTNER)
  @ApiOperation({ summary: 'Elimina quotazione (solo DRAFT)' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<void> {
    return this.quotationsService.delete(id, user.id);
  }

  @Post(':id/submit')
  @Roles(UserRole.PARTNER)
  @ApiOperation({ summary: 'Invia quotazione a Salesforce' })
  @ApiResponse({ status: 200, type: SubmitQuotationResponseDto })
  async submit(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ): Promise<SubmitQuotationResponseDto> {
    return this.quotationsService.submitToSalesforce(id, user.id);
  }
}
```

### Service

```typescript
// quotations/quotations.service.ts

@Injectable()
export class QuotationsService {
  private readonly logger = new Logger(QuotationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly salesforceService: SalesforceService,
  ) {}

  /**
   * Crea quotazione in stato DRAFT
   */
  async create(userId: string, dto: CreateQuotationDto): Promise<QuotationResponseDto> {
    const quotation = await this.prisma.quotation.create({
      data: {
        userId,
        status: QuotationStatus.DRAFT,
        ...dto,
        requestedDeliveryDate: dto.requestedDeliveryDate
          ? new Date(dto.requestedDeliveryDate)
          : null,
      },
    });

    return this.toResponseDto(quotation);
  }

  /**
   * Aggiorna quotazione - SOLO se in stato DRAFT
   */
  async update(
    id: string,
    userId: string,
    dto: UpdateQuotationDto,
  ): Promise<QuotationResponseDto> {
    const quotation = await this.findOneOrFail(id, userId);

    // Verifica che sia ancora modificabile
    if (quotation.status !== QuotationStatus.DRAFT) {
      throw new BadRequestException(
        'Impossibile modificare: quotazione già inviata a Salesforce',
      );
    }

    const updated = await this.prisma.quotation.update({
      where: { id },
      data: {
        ...dto,
        requestedDeliveryDate: dto.requestedDeliveryDate
          ? new Date(dto.requestedDeliveryDate)
          : undefined,
      },
    });

    return this.toResponseDto(updated);
  }

  /**
   * Elimina quotazione - SOLO se in stato DRAFT
   */
  async delete(id: string, userId: string): Promise<void> {
    const quotation = await this.findOneOrFail(id, userId);

    if (quotation.status !== QuotationStatus.DRAFT) {
      throw new BadRequestException(
        'Impossibile eliminare: quotazione già inviata a Salesforce',
      );
    }

    await this.prisma.quotation.delete({ where: { id } });
  }

  /**
   * Invia quotazione a Salesforce
   * - Crea record in SF
   * - Riceve Quote Number
   * - Marca come SUBMITTED (diventa READ-ONLY)
   */
  async submitToSalesforce(
    id: string,
    userId: string,
  ): Promise<SubmitQuotationResponseDto> {
    const quotation = await this.findOneOrFail(id, userId);

    if (quotation.status !== QuotationStatus.DRAFT) {
      throw new BadRequestException('Quotazione già inviata');
    }

    // Recupera dati utente per SF
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    // Crea record in Salesforce
    const sfResult = await this.salesforceService.createQuotation({
      accountId: user.salesforceAccountId,
      ...quotation,
    });

    // Aggiorna locale con dati SF
    const updated = await this.prisma.quotation.update({
      where: { id },
      data: {
        status: QuotationStatus.SUBMITTED,
        salesforceQuoteId: sfResult.id,
        salesforceQuoteNumber: sfResult.quoteNumber,
        phase: QuotationPhase.RICEVUTA,
        lastSyncAt: new Date(),
      },
    });

    this.logger.log(
      `Quotazione ${id} inviata a SF: ${sfResult.quoteNumber}`,
    );

    return {
      success: true,
      quotationId: id,
      salesforceQuoteId: sfResult.id,
      salesforceQuoteNumber: sfResult.quoteNumber,
      message: `Quotazione inviata con successo. Numero: ${sfResult.quoteNumber}`,
    };
  }

  /**
   * Aggiorna quotazione da webhook Salesforce
   * Chiamato quando SF modifica fase, pricing, note
   */
  async updateFromSalesforce(dto: SalesforceQuotationWebhookDto): Promise<void> {
    const quotation = await this.prisma.quotation.findFirst({
      where: { salesforceQuoteId: dto.quotationId },
    });

    if (!quotation) {
      this.logger.warn(`Quotazione SF non trovata: ${dto.quotationId}`);
      return;
    }

    await this.prisma.quotation.update({
      where: { id: quotation.id },
      data: {
        phase: dto.phase,
        totalCostCents: dto.totalCostCents,
        ytecNotes: dto.ytecNotes,
        lastSyncAt: new Date(),
      },
    });

    this.logger.log(
      `Quotazione ${quotation.id} aggiornata da SF: fase ${dto.phase}`,
    );
  }

  // ... altri metodi helper
}
```

### Webhook Controller

```typescript
// quotations/quotations-webhook.controller.ts

@Controller('custom/webhooks/salesforce')
export class QuotationsWebhookController {
  private readonly logger = new Logger(QuotationsWebhookController.name);

  constructor(private readonly quotationsService: QuotationsService) {}

  @Post('quotation')
  @Public() // No JWT
  @UseGuards(SalesforceWebhookGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook SF per aggiornamenti quotazione' })
  async handleQuotationUpdate(
    @Body() payload: SalesforceQuotationWebhookDto,
  ): Promise<{ success: boolean }> {
    this.logger.log(`Webhook quotazione ricevuto: ${JSON.stringify(payload)}`);

    try {
      await this.quotationsService.updateFromSalesforce(payload);
      return { success: true };
    } catch (error) {
      this.logger.error(`Errore webhook: ${error.message}`);
      return { success: false };
    }
  }
}
```

### Campi Quotazione - Riepilogo

| Categoria | Campi | Editabili | Note |
|-----------|-------|-----------|------|
| **Progetto** | projectName, customerBudgetCents, installationCity, requestedDeliveryDate | ✅ Solo DRAFT | Info base progetto |
| **Installazione** | internetConnection, contentType, contentManagement, anchoringSystem, anchoringMaterial | ✅ Solo DRAFT | Picklist SF |
| **Cliente** | customerCategory, hasExistingSoftware, needsVideorender | ✅ Solo DRAFT | Caratteristiche cliente |
| **Note** | productsDescription, commercialNotes, needsSiteSurvey | ✅ Solo DRAFT | Testo libero |
| **Configurazione** | requestedWidthMm, requestedHeightMm, pixelPitchTenths, totalModules, modulesX, modulesY, actualWidthMm, actualHeightMm, resolutionX, resolutionY, receivingCards, estimatedPriceInCents | ✅ Solo DRAFT | Calcolati dal configuratore |
| **Salesforce** | salesforceQuoteId, salesforceQuoteNumber, phase, totalCostCents, ytecNotes, lastSyncAt | ❌ READ-ONLY | Popolati da SF |

> **⚠️ Importante**: Una volta chiamato `POST /:id/submit`, tutti i campi diventano READ-ONLY.
> Il Partner può solo visualizzare la quotazione. Qualsiasi modifica deve passare da Salesforce.

---

## 9. Slice: Orders

### API Endpoints

| Method | Endpoint | Descrizione | Auth | Ruolo |
|--------|----------|-------------|------|-------|
| GET | `/orders` | Lista ordini utente | JWT | All |
| GET | `/orders/:id` | Dettaglio ordine | JWT | All |
| GET | `/orders/:id/status-history` | Storico stati | JWT | All |
| GET | `/orders/:id/documents` | Documenti ordine | JWT | All |
| POST | `/orders/webhooks/salesforce` | Webhook Salesforce | Webhook | - |

### Webhook Handler

```typescript
// orders/orders-webhook.controller.ts

@Controller('orders/webhooks')
export class OrdersWebhookController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly emailService: EmailService,
  ) {}

  @Post('salesforce')
  @Public() // No JWT, usa guard specifico
  @UseGuards(SalesforceWebhookGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook da Salesforce per aggiornamenti stato' })
  async handleSalesforceWebhook(@Body() payload: SalesforceWebhookDto) {
    const logger = new Logger('SalesforceWebhook');

    logger.log(`Webhook ricevuto: ${JSON.stringify(payload)}`);

    try {
      // Trova ordine locale
      const order = await this.ordersService.findBySalesforceOpportunityId(
        payload.opportunityId,
      );

      if (!order) {
        logger.warn(`Ordine non trovato per opportunity: ${payload.opportunityId}`);
        return { success: false, error: 'Order not found' };
      }

      // Mappa stato Salesforce a stato locale
      const newStatus = this.mapSalesforceStatus(payload.status, order.type);

      // Aggiorna stato
      await this.ordersService.updateStatus(order.id, {
        status: newStatus,
        notes: payload.notes,
        metadata: payload.metadata,
        createdBy: 'SALESFORCE',
      });

      // Notifica utente via email
      await this.emailService.sendOrderStatusChanged(
        order.customerInfo.email,
        {
          orderNumber: order.orderNumber,
          status: newStatus,
          notes: payload.notes,
          metadata: payload.metadata,
        },
      );

      return { success: true, orderId: order.id, statusUpdated: true };
    } catch (error) {
      logger.error(`Errore webhook: ${error.message}`, error.stack);
      throw error;
    }
  }

  private mapSalesforceStatus(sfStatus: string, orderType: OrderType): string {
    // Mappa stati Salesforce agli stati locali
    const standardMapping: Record<string, string> = {
      'In Production': 'IN_SPEDIZIONE',
      'Shipped': 'IN_SPEDIZIONE',
      'Delivered': 'CONSEGNATO',
      'Installed': 'IN_INSTALLAZIONE',
      'Testing': 'COLLAUDO',
    };

    const customMapping: Record<string, string> = {
      'New': 'RICHIESTA_RICEVUTA',
      'Technical Review': 'VALUTAZIONE_TECNICA',
      'Quoted': 'PREVENTIVAZIONE',
      'In Production': 'PRODUZIONE',
      'Shipped': 'SPEDIZIONE',
      'Installing': 'INSTALLAZIONE',
    };

    const mapping = orderType === OrderType.STANDARD ? standardMapping : customMapping;
    return mapping[sfStatus] || sfStatus;
  }
}
```

---

## 10. Slice: Admin

### API Endpoints

| Method | Endpoint | Descrizione | Auth | Ruolo |
|--------|----------|-------------|------|-------|
| GET | `/admin/dashboard/stats` | Statistiche dashboard | JWT | ADMIN |
| GET | `/admin/orders` | Tutti gli ordini | JWT | ADMIN |
| PUT | `/admin/orders/:id/status` | Aggiorna stato ordine | JWT | ADMIN |
| GET | `/admin/salesforce/sync-status` | Stato sync Salesforce | JWT | ADMIN |
| POST | `/admin/salesforce/force-sync` | Forza sync | JWT | ADMIN |
| GET | `/admin/audit-logs` | Log di audit | JWT | ADMIN |
| GET | `/admin/config` | Configurazioni sistema | JWT | ADMIN |
| PUT | `/admin/config/:key` | Aggiorna config | JWT | ADMIN |

### Dashboard Stats

```typescript
// admin/admin.service.ts

async getDashboardStats(): Promise<DashboardStatsDto> {
  const [
    ordersCount,
    ordersByStatus,
    ordersByType,
    revenueStats,
    usersCount,
    salesforceStatus,
  ] = await Promise.all([
    this.orderRepository.count(),
    this.orderRepository.countByStatus(),
    this.orderRepository.countByType(),
    this.orderRepository.getRevenueStats(),
    this.userRepository.count({ where: { isActive: true } }),
    this.salesforceService.getHealthStatus(),
  ]);

  return {
    orders: {
      total: ordersCount,
      byStatus: ordersByStatus,
      byType: ordersByType,
    },
    revenue: {
      total: revenueStats.total / 100, // Converti da centesimi
      thisMonth: revenueStats.thisMonth / 100,
      lastMonth: revenueStats.lastMonth / 100,
      growth: revenueStats.growth,
    },
    users: {
      total: usersCount,
      active: usersCount, // Già filtrati per isActive
    },
    salesforce: {
      status: salesforceStatus.isHealthy ? 'HEALTHY' : 'ERROR',
      lastSync: salesforceStatus.lastSync,
      pendingWebhooks: salesforceStatus.pendingWebhooks,
    },
  };
}
```

---

## 11. Infrastructure Services

### PrismaService

```typescript
// infrastructure/database/prisma.service.ts

import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
    });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');

    // Log queries in development
    if (process.env.NODE_ENV === 'development') {
      this.$on('query' as any, (event: any) => {
        this.logger.debug(`Query: ${event.query}`);
        this.logger.debug(`Duration: ${event.duration}ms`);
      });
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Database disconnected');
  }

  // Helper per soft delete
  async softDelete(model: string, id: string) {
    return (this as any)[model].update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
```

### EmailService

```typescript
// infrastructure/email/email.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private templates: Map<string, handlebars.TemplateDelegate> = new Map();

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASSWORD'),
      },
    });

    this.loadTemplates();
  }

  private async loadTemplates() {
    const templatesDir = path.join(__dirname, 'templates');

    try {
      const files = await fs.readdir(templatesDir);

      for (const file of files) {
        if (file.endsWith('.hbs')) {
          const name = file.replace('.hbs', '');
          const content = await fs.readFile(path.join(templatesDir, file), 'utf-8');
          this.templates.set(name, handlebars.compile(content));
        }
      }

      this.logger.log(`Loaded ${this.templates.size} email templates`);
    } catch (error) {
      this.logger.warn('Could not load email templates');
    }
  }

  async send(options: {
    to: string | string[];
    subject: string;
    template: string;
    context: Record<string, any>;
    attachments?: Array<{ filename: string; path?: string; content?: Buffer }>;
  }): Promise<boolean> {
    try {
      const template = this.templates.get(options.template);

      if (!template) {
        this.logger.error(`Template ${options.template} not found`);
        return false;
      }

      const html = template(options.context);

      await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM'),
        to: options.to,
        subject: options.subject,
        html,
        attachments: options.attachments,
      });

      this.logger.log(`Email sent to ${options.to}: ${options.subject}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      return false;
    }
  }

  async sendQuoteGenerated(to: string, quote: any, pdfPath: string) {
    return this.send({
      to,
      subject: `Preventivo ${quote.quoteNumber} - LEDWall B2B`,
      template: 'quote-generated',
      context: { quote },
      attachments: [
        {
          filename: `preventivo_${quote.quoteNumber}.pdf`,
          path: pdfPath,
        },
      ],
    });
  }

  async sendOrderStatusChanged(to: string, order: any) {
    return this.send({
      to,
      subject: `Aggiornamento ordine ${order.orderNumber} - LEDWall B2B`,
      template: 'order-status-changed',
      context: { order },
    });
  }

  async sendCustomRequestReceived(to: string, request: any) {
    return this.send({
      to,
      subject: 'Richiesta configurazione custom ricevuta - LEDWall B2B',
      template: 'custom-request-received',
      context: { request },
    });
  }
}
```

### PDFService

```typescript
// infrastructure/pdf/pdf.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as puppeteer from 'puppeteer';
import * as handlebars from 'handlebars';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);
  private templates: Map<string, handlebars.TemplateDelegate> = new Map();
  private styles: string;

  constructor(private readonly configService: ConfigService) {
    this.loadTemplates();
  }

  private async loadTemplates() {
    const templatesDir = path.join(__dirname, 'templates');

    try {
      this.styles = await fs.readFile(
        path.join(templatesDir, 'styles.css'),
        'utf-8',
      );

      const files = await fs.readdir(templatesDir);

      for (const file of files) {
        if (file.endsWith('.hbs')) {
          const name = file.replace('.hbs', '');
          const content = await fs.readFile(path.join(templatesDir, file), 'utf-8');
          this.templates.set(name, handlebars.compile(content));
        }
      }

      this.logger.log(`Loaded ${this.templates.size} PDF templates`);
    } catch (error) {
      this.logger.warn('Could not load PDF templates');
    }
  }

  async generate(options: {
    template: string;
    data: Record<string, any>;
    outputPath: string;
  }): Promise<string> {
    const template = this.templates.get(options.template);

    if (!template) {
      throw new Error(`Template ${options.template} not found`);
    }

    const html = this.wrapWithStyles(template(options.data));

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      // Assicurati che la directory esista
      const outputDir = path.dirname(options.outputPath);
      await fs.mkdir(outputDir, { recursive: true });

      await page.pdf({
        path: options.outputPath,
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
      });

      this.logger.log(`PDF generated: ${options.outputPath}`);
      return options.outputPath;
    } finally {
      await browser.close();
    }
  }

  private wrapWithStyles(content: string): string {
    return `
      <!DOCTYPE html>
      <html lang="it">
        <head>
          <meta charset="UTF-8">
          <style>${this.styles}</style>
        </head>
        <body>${content}</body>
      </html>
    `;
  }

  async generateStandardQuote(quoteData: any): Promise<string> {
    const outputDir = this.configService.get('PDF_OUTPUT_DIR', './storage/pdfs');
    const fileName = `quote_${quoteData.quoteNumber}_${Date.now()}.pdf`;
    const outputPath = path.join(outputDir, fileName);

    await this.generate({
      template: 'quote-standard',
      data: quoteData,
      outputPath,
    });

    return outputPath;
  }

  async generateCustomQuote(quoteData: any): Promise<string> {
    const outputDir = this.configService.get('PDF_OUTPUT_DIR', './storage/pdfs');
    const fileName = `quote_custom_${quoteData.quoteNumber}_${Date.now()}.pdf`;
    const outputPath = path.join(outputDir, fileName);

    await this.generate({
      template: 'quote-custom',
      data: quoteData,
      outputPath,
    });

    return outputPath;
  }
}
```

### SalesforceService

```typescript
// infrastructure/salesforce/salesforce.service.ts

import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SalesforceService {
  private readonly logger = new Logger(SalesforceService.name);
  private accessToken: string;
  private instanceUrl: string;
  private tokenExpiresAt: number = 0;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  private async ensureAuthenticated(): Promise<void> {
    // Rinnova token se scaduto o in scadenza (5 minuti di margine)
    if (Date.now() >= this.tokenExpiresAt - 300000) {
      await this.authenticate();
    }
  }

  private async authenticate(): Promise<void> {
    try {
      const loginUrl = this.configService.get('SALESFORCE_LOGIN_URL');

      const response = await firstValueFrom(
        this.httpService.post(
          `${loginUrl}/services/oauth2/token`,
          new URLSearchParams({
            grant_type: 'password',
            client_id: this.configService.get('SALESFORCE_CLIENT_ID'),
            client_secret: this.configService.get('SALESFORCE_CLIENT_SECRET'),
            username: this.configService.get('SALESFORCE_USERNAME'),
            password: `${this.configService.get('SALESFORCE_PASSWORD')}${this.configService.get('SALESFORCE_SECURITY_TOKEN')}`,
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ),
      );

      this.accessToken = response.data.access_token;
      this.instanceUrl = response.data.instance_url;
      this.tokenExpiresAt = Date.now() + 7200000; // 2 ore

      this.logger.log('Salesforce authentication successful');
    } catch (error) {
      this.logger.error('Salesforce authentication failed', error);
      throw new HttpException(
        'Salesforce authentication failed',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async authenticateUser(email: string, password: string): Promise<any> {
    await this.ensureAuthenticated();

    try {
      // Query per trovare il Contact
      const query = `SELECT Id, Email, FirstName, LastName, Account.Name FROM Contact WHERE Email = '${email}'`;

      const response = await firstValueFrom(
        this.httpService.get(
          `${this.instanceUrl}/services/data/v58.0/query`,
          {
            params: { q: query },
            headers: { Authorization: `Bearer ${this.accessToken}` },
          },
        ),
      );

      if (response.data.totalSize === 0) {
        return null;
      }

      const contact = response.data.records[0];

      // In produzione: validare password contro campo custom o sistema esterno
      // Per ora, la presenza in Salesforce è sufficiente

      return {
        id: contact.Id,
        email: contact.Email,
        firstName: contact.FirstName,
        lastName: contact.LastName,
        companyName: contact.Account?.Name,
      };
    } catch (error) {
      this.logger.error(`User authentication failed: ${error.message}`);
      return null;
    }
  }

  async createLead(data: any): Promise<string> {
    await this.ensureAuthenticated();

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.instanceUrl}/services/data/v58.0/sobjects/Lead`,
          {
            FirstName: data.firstName,
            LastName: data.lastName,
            Company: data.company,
            Email: data.email,
            Phone: data.phone,
            Description: data.description,
            LeadSource: 'B2B_Configurator',
            Status: 'New',
          },
          {
            headers: { Authorization: `Bearer ${this.accessToken}` },
          },
        ),
      );

      this.logger.log(`Lead created: ${response.data.id}`);
      return response.data.id;
    } catch (error) {
      this.logger.error(`Failed to create Lead: ${error.message}`);
      throw new HttpException(
        'Failed to create Lead in Salesforce',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createOpportunity(data: any): Promise<string> {
    await this.ensureAuthenticated();

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.instanceUrl}/services/data/v58.0/sobjects/Opportunity`,
          {
            Name: data.name,
            Amount: data.amount,
            StageName: data.stage,
            CloseDate: data.closeDate.toISOString().split('T')[0],
            Description: data.description,
            Type: data.type,
            LeadSource: 'B2B_Configurator',
          },
          {
            headers: { Authorization: `Bearer ${this.accessToken}` },
          },
        ),
      );

      this.logger.log(`Opportunity created: ${response.data.id}`);
      return response.data.id;
    } catch (error) {
      this.logger.error(`Failed to create Opportunity: ${error.message}`);
      throw new HttpException(
        'Failed to create Opportunity in Salesforce',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getHealthStatus() {
    try {
      await this.ensureAuthenticated();
      return {
        isHealthy: true,
        lastSync: new Date(),
        pendingWebhooks: 0,
      };
    } catch {
      return {
        isHealthy: false,
        lastSync: null,
        pendingWebhooks: 0,
      };
    }
  }
}
```

---

## 12. Guards e Middleware

### JwtAuthGuard

```typescript
// common/guards/jwt-auth.guard.ts

import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Controlla se l'endpoint è pubblico
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Token non valido o scaduto');
    }
    return user;
  }
}
```

### RolesGuard

```typescript
// common/guards/roles.guard.ts

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
```

### Decorators

```typescript
// common/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

// common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

---

## 13. Error Handling

### HttpExceptionFilter

```typescript
// common/filters/http-exception.filter.ts

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Errore interno del server';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        error = (exceptionResponse as any).error || error;
      }
    }

    // Log errore
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(`${request.method} ${request.url} - ${status} - ${message}`);
    }

    response.status(status).json({
      error: {
        statusCode: status,
        message,
        error,
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    });
  }
}
```

### PrismaExceptionFilter

```typescript
// common/filters/prisma-exception.filter.ts

import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Errore database';

    switch (exception.code) {
      case 'P2002':
        status = HttpStatus.CONFLICT;
        const target = (exception.meta as any)?.target;
        message = `Valore duplicato per: ${target}`;
        break;
      case 'P2025':
        status = HttpStatus.NOT_FOUND;
        message = 'Record non trovato';
        break;
      case 'P2003':
        status = HttpStatus.BAD_REQUEST;
        message = 'Riferimento a record inesistente';
        break;
    }

    response.status(status).json({
      error: {
        statusCode: status,
        message,
        code: exception.code,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
```

---

## 14. Deploy e PM2

### ecosystem.config.js

```javascript
module.exports = {
  apps: [
    {
      name: 'ledwall-backend',
      script: 'dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      error_file: '/var/log/pm2/ledwall-error.log',
      out_file: '/var/log/pm2/ledwall-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      autorestart: true,
      max_memory_restart: '1G',
      watch: false,
    },
  ],
};
```

### Script Deploy

```bash
#!/bin/bash
# deploy.sh

echo "🚀 Deploying LEDWall Backend..."

# Pull latest code
git pull origin main

# Install dependencies
npm ci

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Build
npm run build

# Restart PM2
pm2 reload ecosystem.config.js --env production

echo "✅ Deploy completed!"
```

### Comandi PM2

```bash
# Avvia applicazione
pm2 start ecosystem.config.js

# Visualizza status
pm2 status

# Visualizza logs
pm2 logs ledwall-backend

# Reload graceful (zero downtime)
pm2 reload ledwall-backend

# Restart
pm2 restart ledwall-backend

# Stop
pm2 stop ledwall-backend

# Salva configurazione per startup
pm2 save
pm2 startup
```

---

## Checklist Implementazione

- [ ] Setup progetto NestJS
- [ ] Configurazione Prisma + PostgreSQL
- [ ] Implementazione Auth slice
- [ ] Implementazione Catalog slice
- [ ] Implementazione Standard Configurator slice
- [ ] Implementazione Custom Configurator slice
- [ ] Implementazione Orders slice
- [ ] Implementazione Admin slice
- [ ] Setup EmailService
- [ ] Setup PdfService
- [ ] Setup SalesforceService
- [ ] Test endpoints con Swagger
- [ ] Deploy con PM2

---

*Documentazione Backend - B2B LEDWall Configurator*
