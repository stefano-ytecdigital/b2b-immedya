/**
 * Common API types
 */

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * User types
 */
export type UserRole = 'PARTNER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  company?: string;
  salesforceAccountId?: string;
  orderEmail?: string;
  billingEmail?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Auth types
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
}

/**
 * Product types
 */
export type ProductType = 'STANDARD' | 'CUSTOM';

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  outdoorCompatible: boolean;
  description?: string;
  technicalSheetUrl?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Module types
 */
export interface Module {
  id: string;
  name: string;
  productId: string;
  widthMm: number;
  heightMm: number;
  pixelPitch: number;
  resolutionWidth: number;
  resolutionHeight: number;
  powerConsumptionW: number;
  weightKg: number;
  maxPixelsPerCard?: number;
  unitPriceCents: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Kit types
 */
export interface Kit {
  id: string;
  name: string;
  productId: string;
  description?: string;
  imageUrl?: string;
  totalWidthMm: number;
  totalHeightMm: number;
  totalResolutionW: number;
  totalResolutionH: number;
  pixelPitch: number;
  totalPriceCents: number;
  createdAt: string;
  updatedAt: string;
  product?: Product;
  modules?: KitModule[];
}

export interface KitModule {
  id: string;
  kitId: string;
  moduleId: string;
  quantity: number;
  module: Module;
}

/**
 * Quotation types
 */
export type QuotationPhase = 'DRAFT' | 'SUBMITTED' | 'READY' | 'CLOSED';
export type InternetConnection = 'WIRED' | 'WIFI' | 'LTE_4G';
export type ContentType = 'ADVERTISING' | 'TV_EXTERNAL' | 'INTERACTIVE';
export type ContentManagement = 'BY_CUSTOMER' | 'BY_AGENCY' | 'BY_IMMEDYA';
export type AnchoringSystem = 'WALL' | 'FLOOR' | 'CEILING' | 'FREESTANDING' | 'OTHER';
export type AnchoringMaterial = 'DRYWALL' | 'CONCRETE' | 'WOOD' | 'GLASS_METAL' | 'FREESTANDING' | 'OTHER';
export type CustomerCategory = 'B2B' | 'B2C' | 'PUBLIC_SECTOR';

export interface Quotation {
  id: string;
  userId: string;
  kitId?: string;
  salesforceQuoteId?: string;
  salesforceQuoteNumber?: string;
  phase: QuotationPhase;
  lastSyncAt?: string;
  projectName: string;
  customerBudgetCents?: number;
  installationCity?: string;
  requestedDeliveryDate?: string;
  internetConnection?: InternetConnection;
  contentType?: ContentType;
  contentManagement?: ContentManagement;
  anchoringSystem?: AnchoringSystem;
  anchoringMaterial?: AnchoringMaterial;
  customerCategory?: CustomerCategory;
  hasExistingSoftware: boolean;
  needsVideorender: boolean;
  productsDescription?: string;
  commercialNotes?: string;
  needsSiteSurvey: boolean;
  configurationJson?: string;
  totalCostCents?: number;
  ytecNotes?: string;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
  kit?: Kit;
  user?: User;
}

export interface CreateQuotationRequest {
  kitId: string;
  quantity: number;
  projectName: string;
  customerBudgetCents?: number;
  installationCity?: string;
  requestedDeliveryDate?: string;
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
}

export interface CalculateQuoteRequest {
  kitId: string;
  quantity: number;
}

export interface CalculateQuoteResponse {
  kit: {
    id: string;
    name: string;
    description?: string;
  };
  quantity: number;
  dimensions: {
    widthMm: number;
    heightMm: number;
  };
  resolution: {
    width: number;
    height: number;
  };
  pixelPitch: number;
  estimatedPriceCents: number;
  estimatedPowerConsumptionW: number;
  modules: Array<{
    name: string;
    quantity: number;
    dimensions: string;
    unitPriceCents: number;
  }>;
}
