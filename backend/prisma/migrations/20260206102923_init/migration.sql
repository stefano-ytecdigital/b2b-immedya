-- CreateEnum
CREATE TYPE "QuotationPhase" AS ENUM ('DRAFT', 'SUBMITTED', 'READY', 'CLOSED');

-- CreateEnum
CREATE TYPE "InternetConnection" AS ENUM ('WIRED', 'WIFI', 'LTE_4G');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('ADVERTISING', 'TV_EXTERNAL', 'INTERACTIVE');

-- CreateEnum
CREATE TYPE "ContentManagement" AS ENUM ('BY_CUSTOMER', 'BY_AGENCY', 'BY_IMMEDYA');

-- CreateEnum
CREATE TYPE "AnchoringSystem" AS ENUM ('WALL', 'FLOOR', 'CEILING', 'FREESTANDING', 'OTHER');

-- CreateEnum
CREATE TYPE "AnchoringMaterial" AS ENUM ('DRYWALL', 'CONCRETE', 'WOOD', 'GLASS_METAL', 'FREESTANDING', 'OTHER');

-- CreateEnum
CREATE TYPE "CustomerCategory" AS ENUM ('B2B', 'B2C', 'PUBLIC_SECTOR');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PARTNER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('STANDARD', 'CUSTOM');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'PARTNER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "salesforceAccountId" TEXT,
    "orderEmail" TEXT,
    "billingEmail" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "company" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ProductType" NOT NULL,
    "outdoorCompatible" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "technicalSheetUrl" TEXT,
    "imageUrl" TEXT,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modules" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "widthMm" INTEGER NOT NULL,
    "heightMm" INTEGER NOT NULL,
    "pixelPitch" DOUBLE PRECISION NOT NULL,
    "resolutionWidth" INTEGER NOT NULL,
    "resolutionHeight" INTEGER NOT NULL,
    "powerConsumptionW" INTEGER NOT NULL,
    "weightKg" DOUBLE PRECISION NOT NULL,
    "maxPixelsPerCard" INTEGER,
    "unitPriceCents" INTEGER NOT NULL,

    CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kits" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "totalWidthMm" INTEGER NOT NULL,
    "totalHeightMm" INTEGER NOT NULL,
    "totalResolutionW" INTEGER NOT NULL,
    "totalResolutionH" INTEGER NOT NULL,
    "pixelPitch" DOUBLE PRECISION NOT NULL,
    "totalPriceCents" INTEGER NOT NULL,

    CONSTRAINT "kits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kit_modules" (
    "id" TEXT NOT NULL,
    "kitId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "kit_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotations" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "kitId" TEXT,
    "salesforceQuoteId" TEXT,
    "salesforceQuoteNumber" TEXT,
    "phase" "QuotationPhase" NOT NULL DEFAULT 'DRAFT',
    "lastSyncAt" TIMESTAMP(3),
    "projectName" TEXT NOT NULL,
    "customerBudgetCents" INTEGER,
    "installationCity" TEXT,
    "requestedDeliveryDate" TIMESTAMP(3),
    "internetConnection" "InternetConnection",
    "contentType" "ContentType",
    "contentManagement" "ContentManagement",
    "anchoringSystem" "AnchoringSystem",
    "anchoringMaterial" "AnchoringMaterial",
    "customerCategory" "CustomerCategory",
    "hasExistingSoftware" BOOLEAN NOT NULL DEFAULT false,
    "needsVideorender" BOOLEAN NOT NULL DEFAULT false,
    "productsDescription" TEXT,
    "commercialNotes" TEXT,
    "needsSiteSurvey" BOOLEAN NOT NULL DEFAULT false,
    "configurationJson" TEXT,
    "totalCostCents" INTEGER,
    "ytecNotes" TEXT,
    "pdfUrl" TEXT,

    CONSTRAINT "quotations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_salesforceAccountId_key" ON "users"("salesforceAccountId");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_salesforceAccountId_idx" ON "users"("salesforceAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "products_type_idx" ON "products"("type");

-- CreateIndex
CREATE INDEX "modules_productId_idx" ON "modules"("productId");

-- CreateIndex
CREATE INDEX "modules_pixelPitch_idx" ON "modules"("pixelPitch");

-- CreateIndex
CREATE INDEX "kits_productId_idx" ON "kits"("productId");

-- CreateIndex
CREATE INDEX "kits_pixelPitch_idx" ON "kits"("pixelPitch");

-- CreateIndex
CREATE INDEX "kit_modules_kitId_idx" ON "kit_modules"("kitId");

-- CreateIndex
CREATE INDEX "kit_modules_moduleId_idx" ON "kit_modules"("moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "kit_modules_kitId_moduleId_key" ON "kit_modules"("kitId", "moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "quotations_salesforceQuoteId_key" ON "quotations"("salesforceQuoteId");

-- CreateIndex
CREATE INDEX "quotations_userId_idx" ON "quotations"("userId");

-- CreateIndex
CREATE INDEX "quotations_kitId_idx" ON "quotations"("kitId");

-- CreateIndex
CREATE INDEX "quotations_phase_idx" ON "quotations"("phase");

-- CreateIndex
CREATE INDEX "quotations_salesforceQuoteId_idx" ON "quotations"("salesforceQuoteId");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modules" ADD CONSTRAINT "modules_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kits" ADD CONSTRAINT "kits_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kit_modules" ADD CONSTRAINT "kit_modules_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "kits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kit_modules" ADD CONSTRAINT "kit_modules_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_kitId_fkey" FOREIGN KEY ("kitId") REFERENCES "kits"("id") ON DELETE SET NULL ON UPDATE CASCADE;
