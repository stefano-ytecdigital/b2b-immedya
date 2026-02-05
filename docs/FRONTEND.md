# B2B LEDWall Configurator - Documentazione Frontend

> Documentazione tecnica completa per Vite + React + TanStack + shadcn/ui
> Ultima modifica: 2026-02-05

---

## Indice

1. [Setup Progetto](#1-setup-progetto)
2. [Struttura Cartelle](#2-struttura-cartelle)
3. [Configurazione TanStack Router](#3-configurazione-tanstack-router)
4. [Configurazione TanStack Query](#4-configurazione-tanstack-query)
5. [shadcn/ui Setup](#5-shadcnui-setup)
6. [Slice: Auth](#6-slice-auth)
7. [Slice: Catalog](#7-slice-catalog)
8. [Slice: Standard Configurator](#8-slice-standard-configurator)
9. [Slice: Custom Configurator](#9-slice-custom-configurator)
10. [Slice: Orders](#10-slice-orders)
11. [Slice: Admin](#11-slice-admin)
12. [Algoritmo Configuratore (Frontend)](#12-algoritmo-configuratore-frontend)
13. [Componenti UI Custom](#13-componenti-ui-custom)
14. [State Management](#14-state-management)
15. [API Client](#15-api-client)
16. [Build e Deploy](#16-build-e-deploy)

---

## 1. Setup Progetto

### Creazione Progetto

```bash
# Crea progetto Vite + React + TypeScript
npm create vite@latest ledwall-frontend -- --template react-ts
cd ledwall-frontend

# Installa TanStack
npm install @tanstack/react-router @tanstack/react-query
npm install @tanstack/react-table @tanstack/react-form
npm install @tanstack/react-virtual

# Installa utilities
npm install axios zustand
npm install date-fns
npm install clsx tailwind-merge
npm install lucide-react

# Installa Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Installa shadcn/ui dependencies
npm install @radix-ui/react-slot
npm install class-variance-authority
```

### package.json

```json
{
  "name": "ledwall-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-collapsible": "^1.0.3",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-navigation-menu": "^1.1.4",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-progress": "^1.0.3",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-tooltip": "^1.0.7",
    "@tanstack/react-form": "^0.15.0",
    "@tanstack/react-query": "^5.17.0",
    "@tanstack/react-router": "^1.15.0",
    "@tanstack/react-table": "^8.11.0",
    "@tanstack/react-virtual": "^3.1.0",
    "axios": "^1.6.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "date-fns": "^3.2.0",
    "lucide-react": "^0.309.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tailwind-merge": "^2.2.0",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.2.2",
    "vite": "^5.0.8"
  }
}
```

### vite.config.ts

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
```

### tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
```

### src/index.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 84% 4.9%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: hsl(var(--muted));
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: hsl(var(--muted-foreground) / 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground) / 0.5);
}
```

---

## 2. Struttura Cartelle

```
src/
├── main.tsx                      # Entry point
├── App.tsx                       # Root component con providers
├── index.css                     # Global styles + Tailwind
│
├── components/                   # Componenti UI riutilizzabili
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   ├── dialog.tsx
│   │   ├── toast.tsx
│   │   └── ...
│   └── shared/                   # Componenti custom condivisi
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       ├── PageHeader.tsx
│       └── EmptyState.tsx
│
├── features/                     # Vertical Slices
│   ├── auth/
│   │   ├── index.ts              # Public exports
│   │   ├── routes.tsx            # Route definitions
│   │   ├── api/
│   │   │   ├── queries.ts        # TanStack Query hooks
│   │   │   └── mutations.ts
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── AuthCallback.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   └── types/
│   │       └── index.ts
│   │
│   ├── catalog/
│   │   ├── index.ts
│   │   ├── routes.tsx
│   │   ├── api/
│   │   ├── components/
│   │   │   ├── ProductList.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   └── ModuleSelector.tsx
│   │   └── types/
│   │
│   ├── standard-configurator/
│   │   ├── index.ts
│   │   ├── routes.tsx
│   │   ├── api/
│   │   ├── components/
│   │   │   ├── KitBrowser.tsx
│   │   │   ├── KitCard.tsx
│   │   │   ├── QuotePreview.tsx
│   │   │   └── ConfirmOrder.tsx
│   │   └── types/
│   │
│   ├── custom-configurator/
│   │   ├── index.ts
│   │   ├── routes.tsx
│   │   ├── api/
│   │   ├── components/
│   │   │   ├── ConfigWizard.tsx
│   │   │   ├── DimensionsStep.tsx
│   │   │   ├── PitchStep.tsx
│   │   │   ├── ModulesStep.tsx
│   │   │   ├── PreviewStep.tsx
│   │   │   ├── SubmitStep.tsx
│   │   │   └── LEDWallPreview.tsx
│   │   ├── hooks/
│   │   │   ├── useConfigurator.ts
│   │   │   └── useCalculation.ts
│   │   ├── utils/
│   │   │   └── calculator.ts
│   │   └── types/
│   │
│   ├── orders/
│   │   ├── index.ts
│   │   ├── routes.tsx
│   │   ├── api/
│   │   ├── components/
│   │   │   ├── OrdersList.tsx
│   │   │   ├── OrderDetail.tsx
│   │   │   ├── OrderTimeline.tsx
│   │   │   └── OrderDocuments.tsx
│   │   └── types/
│   │
│   └── admin/
│       ├── index.ts
│       ├── routes.tsx
│       ├── api/
│       ├── components/
│       │   ├── Dashboard.tsx
│       │   ├── ProductsTable.tsx
│       │   ├── KitsTable.tsx
│       │   ├── OrdersTable.tsx
│       │   └── SystemConfig.tsx
│       └── types/
│
├── layouts/
│   ├── MainLayout.tsx            # Layout per utenti
│   ├── AdminLayout.tsx           # Layout admin con sidebar
│   └── AuthLayout.tsx            # Layout pagine auth
│
├── lib/                          # Utilities
│   ├── api.ts                    # Axios instance
│   ├── utils.ts                  # Helpers (cn, formatters)
│   ├── constants.ts              # Costanti app
│   └── validators.ts             # Funzioni validazione
│
├── hooks/                        # Hooks globali
│   ├── useLocalStorage.ts
│   ├── useMediaQuery.ts
│   └── useDebounce.ts
│
├── stores/                       # Zustand stores
│   ├── authStore.ts
│   └── configStore.ts
│
├── routes/                       # TanStack Router
│   ├── __root.tsx                # Root route
│   ├── index.tsx                 # Home route
│   ├── _authenticated.tsx        # Layout route protetto
│   └── routeTree.gen.ts          # Auto-generated
│
└── types/                        # Types globali
    ├── api.ts
    └── index.ts
```

---

## 3. Configurazione TanStack Router

### main.tsx

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { routeTree } from './routes/routeTree.gen'
import './index.css'

// Crea router
const router = createRouter({ routeTree })

// Crea query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minuti
      retry: 1,
    },
  },
})

// Type safety per router
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
)
```

### routes/__root.tsx

```typescript
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Toaster } from '@/components/ui/toaster'

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster />
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </>
  ),
})
```

### routes/_authenticated.tsx

```typescript
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/authStore'
import { MainLayout } from '@/layouts/MainLayout'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) {
      throw redirect({ to: '/login' })
    }
  },
  component: () => (
    <MainLayout>
      <Outlet />
    </MainLayout>
  ),
})
```

### routes/_authenticated/index.tsx

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { HomePage } from '@/features/home/components/HomePage'

export const Route = createFileRoute('/_authenticated/')({
  component: HomePage,
})
```

### routes/_authenticated/catalog/index.tsx

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { CatalogPage } from '@/features/catalog/components/CatalogPage'

export const Route = createFileRoute('/_authenticated/catalog/')({
  component: CatalogPage,
})
```

### routes/_authenticated/configurator/standard.tsx

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { StandardConfiguratorPage } from '@/features/standard-configurator/components/StandardConfiguratorPage'

export const Route = createFileRoute('/_authenticated/configurator/standard')({
  component: StandardConfiguratorPage,
})
```

### routes/_authenticated/configurator/custom.tsx

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { CustomConfiguratorPage } from '@/features/custom-configurator/components/CustomConfiguratorPage'

export const Route = createFileRoute('/_authenticated/configurator/custom')({
  component: CustomConfiguratorPage,
})
```

### routes/_authenticated/orders/index.tsx

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { OrdersPage } from '@/features/orders/components/OrdersPage'

export const Route = createFileRoute('/_authenticated/orders/')({
  component: OrdersPage,
})
```

### routes/_authenticated/orders/$orderId.tsx

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { OrderDetailPage } from '@/features/orders/components/OrderDetailPage'

export const Route = createFileRoute('/_authenticated/orders/$orderId')({
  component: OrderDetailPage,
})
```

### routes/_admin.tsx (Layout Admin)

```typescript
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/authStore'
import { AdminLayout } from '@/layouts/AdminLayout'

export const Route = createFileRoute('/_admin')({
  beforeLoad: () => {
    const { user, isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      throw redirect({ to: '/' })
    }
  },
  component: () => (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  ),
})
```

### Route Tree Completo

```
/                           # Home (redirect a dashboard)
/login                      # Login page
/auth/callback              # OAuth callback

/_authenticated/            # Layout protetto
  /                         # Dashboard utente
  /catalog                  # Catalogo prodotti
  /configurator/standard    # Configuratore kit
  /configurator/custom      # Configuratore expert
  /orders                   # Lista ordini
  /orders/:orderId          # Dettaglio ordine

/_admin/                    # Layout admin
  /admin                    # Dashboard admin
  /admin/products           # Gestione prodotti
  /admin/kits               # Gestione kit
  /admin/orders             # Tutti gli ordini
  /admin/config             # Configurazioni sistema
```

---

## 4. Configurazione TanStack Query

### lib/queryClient.ts

```typescript
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minuti
      gcTime: 1000 * 60 * 30, // 30 minuti (ex cacheTime)
      retry: (failureCount, error: any) => {
        // Non retry su 401/403
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          return false
        }
        return failureCount < 2
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
})
```

### Pattern Query Hook

```typescript
// features/catalog/api/queries.ts

import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Product, Module, ProductFilters } from '../types'

// Query Keys factory
export const catalogKeys = {
  all: ['catalog'] as const,
  products: () => [...catalogKeys.all, 'products'] as const,
  product: (id: string) => [...catalogKeys.products(), id] as const,
  productsList: (filters: ProductFilters) => [...catalogKeys.products(), 'list', filters] as const,
  modules: () => [...catalogKeys.all, 'modules'] as const,
  modulesByPitch: (pitch: number) => [...catalogKeys.modules(), 'pitch', pitch] as const,
  pitches: () => [...catalogKeys.all, 'pitches'] as const,
}

// Lista prodotti
export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: catalogKeys.productsList(filters),
    queryFn: async () => {
      const { data } = await api.get<{ data: Product[]; total: number }>(
        '/catalog/products',
        { params: filters }
      )
      return data
    },
  })
}

// Singolo prodotto
export function useProduct(id: string) {
  return useQuery({
    queryKey: catalogKeys.product(id),
    queryFn: async () => {
      const { data } = await api.get<Product>(`/catalog/products/${id}`)
      return data
    },
    enabled: !!id,
  })
}

// Moduli
export function useModules(productId?: string) {
  return useQuery({
    queryKey: catalogKeys.modules(),
    queryFn: async () => {
      const { data } = await api.get<Module[]>('/catalog/modules', {
        params: productId ? { productId } : undefined,
      })
      return data
    },
  })
}

// Moduli per pitch
export function useModulesByPitch(pitchTenths: number) {
  return useQuery({
    queryKey: catalogKeys.modulesByPitch(pitchTenths),
    queryFn: async () => {
      const { data } = await api.get<Module[]>(`/catalog/modules/by-pitch/${pitchTenths}`)
      return data
    },
    enabled: pitchTenths > 0,
  })
}

// Pixel pitches disponibili
export function useAvailablePitches() {
  return useQuery({
    queryKey: catalogKeys.pitches(),
    queryFn: async () => {
      const { data } = await api.get<number[]>('/catalog/pixel-pitches')
      return data
    },
    staleTime: 1000 * 60 * 60, // 1 ora - cambiano raramente
  })
}
```

### Pattern Mutation Hook

```typescript
// features/standard-configurator/api/mutations.ts

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { ordersKeys } from '@/features/orders/api/queries'
import type { GenerateQuoteDto, QuoteResponse, ConfirmOrderResponse } from '../types'

// Genera preventivo
export function useGenerateQuote() {
  return useMutation({
    mutationFn: async (dto: GenerateQuoteDto) => {
      const { data } = await api.post<QuoteResponse>('/standard/generate-quote', dto)
      return data
    },
    onSuccess: () => {
      // Invalida ordini per aggiornare lista
      const queryClient = useQueryClient()
      queryClient.invalidateQueries({ queryKey: ordersKeys.all })
    },
  })
}

// Conferma ordine
export function useConfirmOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orderId: string) => {
      const { data } = await api.post<ConfirmOrderResponse>(
        '/standard/confirm-order',
        { orderId }
      )
      return data
    },
    onSuccess: (data) => {
      // Invalida ordine specifico e lista
      queryClient.invalidateQueries({ queryKey: ordersKeys.order(data.orderId) })
      queryClient.invalidateQueries({ queryKey: ordersKeys.list({}) })
    },
  })
}
```

---

## 5. shadcn/ui Setup

### Installazione Componenti

```bash
# Installa componenti uno per uno
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add table
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add tooltip
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add alert-dialog
npx shadcn-ui@latest add collapsible
```

### lib/utils.ts

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
  }).format(value)
}

export function formatDate(date: Date | string, format = 'dd/MM/yyyy'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function formatDimensions(widthMm: number, heightMm: number): string {
  return `${(widthMm / 1000).toFixed(2)}m × ${(heightMm / 1000).toFixed(2)}m`
}

export function formatPixelPitch(tenths: number): string {
  return `P${(tenths / 10).toFixed(1)}`
}

export function formatResolution(x: number, y: number): string {
  return `${x}×${y} px`
}
```

---

## 6. Slice: Auth

### stores/authStore.ts

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  companyName?: string
  role: 'ADMIN' | 'PARTNER'
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  login: (tokens: { accessToken: string; refreshToken: string }, user: User) => void
  logout: () => void
  updateTokens: (accessToken: string, refreshToken: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: (tokens, user) =>
        set({
          user,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      updateTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
```

### features/auth/components/LoginForm.tsx

```typescript
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'

import { useLogin } from '../api/mutations'
import { useAuthStore } from '@/stores/authStore'

const loginSchema = z.object({
  email: z.string().email('Email non valida'),
  password: z.string().min(6, 'Password deve avere almeno 6 caratteri'),
})

export function LoginForm() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const login = useAuthStore((state) => state.login)
  const loginMutation = useLogin()

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      try {
        const result = await loginMutation.mutateAsync(value)
        login(
          { accessToken: result.accessToken, refreshToken: result.refreshToken },
          result.user
        )
        toast({
          title: 'Benvenuto!',
          description: `Ciao ${result.user.firstName}`,
        })
        navigate({ to: '/' })
      } catch (error: any) {
        toast({
          title: 'Errore login',
          description: error?.response?.data?.message || 'Credenziali non valide',
          variant: 'destructive',
        })
      }
    },
  })

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Login</CardTitle>
        <CardDescription>
          Accedi con le tue credenziali Salesforce
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <form.Field
            name="email"
            validators={{
              onChange: loginSchema.shape.email,
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@azienda.com"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors.join(', ')}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: loginSchema.shape.password,
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors.join(', ')}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Accesso in corso...
              </>
            ) : (
              'Accedi'
            )}
          </Button>
        </form>

        <div className="relative my-6">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
            oppure
          </span>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleLogin}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Accedi con Google (Admin)
        </Button>
      </CardContent>
    </Card>
  )
}
```

---

## 7. Slice: Catalog

### features/catalog/components/ProductCard.tsx

```typescript
import { Package, Layers, Monitor } from 'lucide-react'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

import type { Product } from '../types'

interface ProductCardProps {
  product: Product
  onSelect?: (product: Product) => void
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{product.name}</CardTitle>
          <Badge variant={product.isActive ? 'default' : 'secondary'}>
            {product.isActive ? 'Disponibile' : 'Non disponibile'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground font-mono">{product.sku}</p>
      </CardHeader>

      <CardContent className="flex-1">
        {product.description && (
          <p className="text-sm text-muted-foreground mb-4">
            {product.description}
          </p>
        )}

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span>Categoria: {product.category.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <span>{product.modulesCount} moduli disponibili</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <span className="text-lg font-semibold">
          {formatCurrency(product.price)}
        </span>
        {onSelect && (
          <Button onClick={() => onSelect(product)}>
            Seleziona
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
```

---

## 8-9. Slice: Configuratori

### features/custom-configurator/components/ConfigWizard.tsx

```typescript
import { useState, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Check, ChevronLeft, ChevronRight, Save } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

import { DimensionsStep } from './DimensionsStep'
import { PitchStep } from './PitchStep'
import { ModulesStep } from './ModulesStep'
import { PreviewStep } from './PreviewStep'
import { SubmitStep } from './SubmitStep'
import { useConfigurator } from '../hooks/useConfigurator'
import { useSubmitCustomRequest } from '../api/mutations'

const STEPS = [
  { id: 'dimensions', label: 'Dimensioni', component: DimensionsStep },
  { id: 'pitch', label: 'Pixel Pitch', component: PitchStep },
  { id: 'modules', label: 'Moduli', component: ModulesStep },
  { id: 'preview', label: 'Preview', component: PreviewStep },
  { id: 'submit', label: 'Invio', component: SubmitStep },
]

export function ConfigWizard() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(0)
  const { config, setConfig, isValid, validationErrors, calculate, reset } = useConfigurator()
  const submitMutation = useSubmitCustomRequest()

  const CurrentStepComponent = STEPS[currentStep].component
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === STEPS.length - 1

  const canGoNext = useCallback(() => {
    const stepId = STEPS[currentStep].id

    switch (stepId) {
      case 'dimensions':
        return config.requestedWidthMm > 0 && config.requestedHeightMm > 0
      case 'pitch':
        return config.pixelPitchTenths > 0
      case 'modules':
        return config.selectedModuleId !== null
      case 'preview':
        return true
      case 'submit':
        return config.customerInfo.email !== ''
      default:
        return false
    }
  }, [currentStep, config])

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      const result = await submitMutation.mutateAsync({
        configuration: config,
        customerInfo: config.customerInfo,
      })

      toast({
        title: 'Richiesta inviata',
        description: `Numero richiesta: ${result.requestId}. Riceverai una risposta entro 48 ore.`,
      })

      reset()
      navigate({ to: '/orders' })
    } catch (error: any) {
      toast({
        title: 'Errore',
        description: error?.response?.data?.message || 'Errore durante invio',
        variant: 'destructive',
      })
    }
  }

  const progressPercent = ((currentStep + 1) / STEPS.length) * 100

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <Progress value={progressPercent} className="h-2" />
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Step {currentStep + 1} di {STEPS.length}
          </span>
          <span className="font-medium">{STEPS[currentStep].label}</span>
        </div>
      </div>

      {/* Step Indicators */}
      <nav aria-label="Progress" className="hidden md:block">
        <ol className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <li key={step.id} className="relative flex-1">
              <div className="flex items-center">
                <span
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors',
                    index < currentStep && 'border-primary bg-primary text-primary-foreground',
                    index === currentStep && 'border-primary bg-background text-primary',
                    index > currentStep && 'border-muted bg-muted text-muted-foreground'
                  )}
                >
                  {index < currentStep ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="ml-3 text-sm font-medium hidden lg:block">
                  {step.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'absolute top-5 left-10 -ml-px h-0.5 w-full transition-colors',
                    index < currentStep ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep].label}</CardTitle>
        </CardHeader>
        <CardContent>
          <CurrentStepComponent
            config={config}
            setConfig={setConfig}
            errors={validationErrors}
          />
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstStep}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Indietro
        </Button>

        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => {}}>
            <Save className="h-4 w-4 mr-2" />
            Salva bozza
          </Button>

          {isLastStep ? (
            <Button
              onClick={handleSubmit}
              disabled={!canGoNext() || submitMutation.isPending}
            >
              {submitMutation.isPending ? 'Invio...' : 'Invia Richiesta'}
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={!canGoNext()}>
              Avanti
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

## 12. Algoritmo Configuratore (Frontend)

### features/custom-configurator/utils/calculator.ts

```typescript
import type { Module, CalculationResult, CompatibilityResult } from '../types'

/**
 * Costanti di configurazione
 */
const CONFIG = {
  MIN_DIMENSION_MM: 500,
  MAX_DIMENSION_MM: 50000,
  MAX_PIXELS_PER_RECEIVING_CARD: 650000,
  OTHER_COSTS_PERCENTAGE: 0.1, // 10% per accessori
  RECEIVING_CARD_PRICE_EUR: 50,
}

/**
 * Verifica compatibilità dimensioni con moduli disponibili
 */
export function checkCompatibility(
  requestedWidthMm: number,
  requestedHeightMm: number,
  pixelPitchTenths: number,
  modules: Module[]
): CompatibilityResult {
  const errors: string[] = []

  // Validazioni base
  if (requestedWidthMm < CONFIG.MIN_DIMENSION_MM) {
    errors.push(`Larghezza minima: ${CONFIG.MIN_DIMENSION_MM}mm`)
  }
  if (requestedHeightMm < CONFIG.MIN_DIMENSION_MM) {
    errors.push(`Altezza minima: ${CONFIG.MIN_DIMENSION_MM}mm`)
  }
  if (requestedWidthMm > CONFIG.MAX_DIMENSION_MM) {
    errors.push(`Larghezza massima: ${CONFIG.MAX_DIMENSION_MM}mm`)
  }
  if (requestedHeightMm > CONFIG.MAX_DIMENSION_MM) {
    errors.push(`Altezza massima: ${CONFIG.MAX_DIMENSION_MM}mm`)
  }

  if (errors.length > 0) {
    return { compatible: false, suggestions: [], errors }
  }

  // Filtra moduli con il pitch richiesto
  const compatibleModules = modules.filter(
    (m) => m.pixelPitchTenths === pixelPitchTenths
  )

  if (compatibleModules.length === 0) {
    return {
      compatible: false,
      suggestions: [],
      errors: [`Nessun modulo disponibile con pitch P${(pixelPitchTenths / 10).toFixed(1)}`],
    }
  }

  // Calcola configurazioni per ogni modulo
  const suggestions = compatibleModules.map((module) => {
    const config = calculateModuleConfiguration(
      requestedWidthMm,
      requestedHeightMm,
      module
    )

    return {
      moduleId: module.id,
      moduleName: module.name,
      moduleDimensions: {
        widthMm: module.widthMm,
        heightMm: module.heightMm,
      },
      configuration: config,
    }
  })

  // Ordina per qualità del fit (EXACT prima, poi CLOSE, poi APPROXIMATE)
  suggestions.sort((a, b) => {
    const qualityOrder = { EXACT: 0, CLOSE: 1, APPROXIMATE: 2 }
    return qualityOrder[a.configuration.fitQuality] - qualityOrder[b.configuration.fitQuality]
  })

  return {
    compatible: true,
    suggestions,
    errors: [],
  }
}

/**
 * Calcola configurazione per un modulo specifico
 */
export function calculateModuleConfiguration(
  requestedWidthMm: number,
  requestedHeightMm: number,
  module: Module
) {
  // Numero di moduli necessari (arrotondamento per eccesso)
  const modulesX = Math.ceil(requestedWidthMm / module.widthMm)
  const modulesY = Math.ceil(requestedHeightMm / module.heightMm)
  const totalModules = modulesX * modulesY

  // Dimensioni effettive
  const actualWidthMm = modulesX * module.widthMm
  const actualHeightMm = modulesY * module.heightMm

  // Risoluzione totale
  const resolutionX = modulesX * module.resolutionX
  const resolutionY = modulesY * module.resolutionY

  // Calcola qualità del fit
  const requestedArea = requestedWidthMm * requestedHeightMm
  const actualArea = actualWidthMm * actualHeightMm
  const wastedArea = actualArea - requestedArea
  const wastedAreaPercent = (wastedArea / requestedArea) * 100

  let fitQuality: 'EXACT' | 'CLOSE' | 'APPROXIMATE'
  if (wastedAreaPercent === 0) {
    fitQuality = 'EXACT'
  } else if (wastedAreaPercent <= 10) {
    fitQuality = 'CLOSE'
  } else {
    fitQuality = 'APPROXIMATE'
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
  }
}

/**
 * Calcola specifiche complete inclusi costi
 */
export function calculateFullSpecification(
  modulesX: number,
  modulesY: number,
  module: Module
): CalculationResult {
  const totalModules = modulesX * modulesY

  // Risoluzione
  const resolution = {
    x: modulesX * module.resolutionX,
    y: modulesY * module.resolutionY,
  }

  // Dimensioni
  const dimensions = {
    widthMm: modulesX * module.widthMm,
    heightMm: modulesY * module.heightMm,
  }

  // Receiving cards necessarie
  const totalPixels = resolution.x * resolution.y
  const receivingCards = Math.ceil(
    totalPixels / CONFIG.MAX_PIXELS_PER_RECEIVING_CARD
  )

  // Peso totale
  const totalWeightKg = (totalModules * module.weightGrams) / 1000

  // Consumo totale
  const totalPowerWatts = totalModules * module.powerWatts

  // Calcolo prezzi
  const modulesPrice = (totalModules * module.priceInCents) / 100
  const receivingCardsPrice = receivingCards * CONFIG.RECEIVING_CARD_PRICE_EUR
  const otherCosts = modulesPrice * CONFIG.OTHER_COSTS_PERCENTAGE
  const estimatedPriceEur = modulesPrice + receivingCardsPrice + otherCosts

  return {
    totalModules,
    modulesX,
    modulesY,
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
  }
}

/**
 * Suggerisce dimensioni ottimali più vicine alle richieste
 */
export function suggestOptimalDimensions(
  requestedWidthMm: number,
  requestedHeightMm: number,
  module: Module
): { widthMm: number; heightMm: number } {
  // Trova multipli più vicini
  const modulesX = Math.round(requestedWidthMm / module.widthMm)
  const modulesY = Math.round(requestedHeightMm / module.heightMm)

  return {
    widthMm: Math.max(1, modulesX) * module.widthMm,
    heightMm: Math.max(1, modulesY) * module.heightMm,
  }
}
```

### features/custom-configurator/hooks/useConfigurator.ts

```typescript
import { useState, useCallback, useMemo } from 'react'
import { useModulesByPitch } from '@/features/catalog/api/queries'
import {
  checkCompatibility,
  calculateFullSpecification,
  suggestOptimalDimensions,
} from '../utils/calculator'
import type { ConfiguratorState, CalculationResult } from '../types'

const initialState: ConfiguratorState = {
  // Dimensioni richieste
  requestedWidthMm: 0,
  requestedHeightMm: 0,

  // Selezioni
  pixelPitchTenths: 0,
  selectedModuleId: null,

  // Configurazione calcolata
  modulesX: 0,
  modulesY: 0,

  // Info cliente
  customerInfo: {
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    notes: '',
  },
}

export function useConfigurator() {
  const [config, setConfigState] = useState<ConfiguratorState>(initialState)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Fetch moduli quando pitch selezionato
  const { data: modules = [] } = useModulesByPitch(config.pixelPitchTenths)

  // Modulo selezionato
  const selectedModule = useMemo(
    () => modules.find((m) => m.id === config.selectedModuleId),
    [modules, config.selectedModuleId]
  )

  // Compatibilità
  const compatibility = useMemo(() => {
    if (
      config.requestedWidthMm === 0 ||
      config.requestedHeightMm === 0 ||
      config.pixelPitchTenths === 0
    ) {
      return null
    }
    return checkCompatibility(
      config.requestedWidthMm,
      config.requestedHeightMm,
      config.pixelPitchTenths,
      modules
    )
  }, [config.requestedWidthMm, config.requestedHeightMm, config.pixelPitchTenths, modules])

  // Calcolo completo
  const calculation = useMemo<CalculationResult | null>(() => {
    if (!selectedModule || config.modulesX === 0 || config.modulesY === 0) {
      return null
    }
    return calculateFullSpecification(config.modulesX, config.modulesY, selectedModule)
  }, [selectedModule, config.modulesX, config.modulesY])

  // Update config con validazione
  const setConfig = useCallback((updates: Partial<ConfiguratorState>) => {
    setConfigState((prev) => {
      const newState = { ...prev, ...updates }

      // Auto-calcola modulesX/Y quando si seleziona modulo
      if (updates.selectedModuleId && !updates.modulesX) {
        const module = modules.find((m) => m.id === updates.selectedModuleId)
        if (module) {
          newState.modulesX = Math.ceil(prev.requestedWidthMm / module.widthMm)
          newState.modulesY = Math.ceil(prev.requestedHeightMm / module.heightMm)
        }
      }

      return newState
    })
  }, [modules])

  // Reset
  const reset = useCallback(() => {
    setConfigState(initialState)
    setValidationErrors({})
  }, [])

  // Validazione step-by-step
  const isValid = useMemo(() => {
    const errors: Record<string, string> = {}

    if (config.requestedWidthMm > 0 && config.requestedWidthMm < 500) {
      errors.requestedWidthMm = 'Larghezza minima 500mm'
    }
    if (config.requestedHeightMm > 0 && config.requestedHeightMm < 500) {
      errors.requestedHeightMm = 'Altezza minima 500mm'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }, [config])

  return {
    config,
    setConfig,
    reset,
    modules,
    selectedModule,
    compatibility,
    calculation,
    isValid,
    validationErrors,
  }
}
```

---

## 13. Componenti UI Custom

### LEDWall Preview (Canvas)

```typescript
// features/custom-configurator/components/LEDWallPreview.tsx

import { useRef, useEffect, useState, useCallback } from 'react'
import { Minus, Plus, RotateCcw, Grid3x3, Layers, Monitor } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface LEDWallPreviewProps {
  config: {
    widthMm: number
    heightMm: number
    moduleWidthMm: number
    moduleHeightMm: number
    modulesX: number
    modulesY: number
    pixelPitchTenths: number
    resolutionX: number
    resolutionY: number
  }
  interactive?: boolean
}

export function LEDWallPreview({ config, interactive = true }: LEDWallPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Calcola scala per adattare al container
  const calculateScale = useCallback(() => {
    if (!containerRef.current) return 1
    const containerWidth = containerRef.current.clientWidth - 80
    const containerHeight = containerRef.current.clientHeight - 80

    const scaleX = containerWidth / config.widthMm
    const scaleY = containerHeight / config.heightMm

    return Math.min(scaleX, scaleY, 1)
  }, [config.widthMm, config.heightMm])

  // Disegna griglia moduli
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const baseScale = calculateScale()
    const scale = baseScale * zoom

    // Imposta dimensioni canvas
    canvas.width = containerRef.current?.clientWidth || 800
    canvas.height = containerRef.current?.clientHeight || 600

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Centra il contenuto
    const contentWidth = config.widthMm * scale
    const contentHeight = config.heightMm * scale
    const offsetX = (canvas.width - contentWidth) / 2 + pan.x
    const offsetY = (canvas.height - contentHeight) / 2 + pan.y

    ctx.save()
    ctx.translate(offsetX, offsetY)
    ctx.scale(scale, scale)

    // Disegna moduli
    for (let row = 0; row < config.modulesY; row++) {
      for (let col = 0; col < config.modulesX; col++) {
        const x = col * config.moduleWidthMm
        const y = row * config.moduleHeightMm
        const moduleIndex = row * config.modulesX + col

        // Background modulo
        ctx.fillStyle = '#1a1a2e'
        ctx.fillRect(x + 2, y + 2, config.moduleWidthMm - 4, config.moduleHeightMm - 4)

        // Border modulo
        ctx.strokeStyle = '#3b3b5c'
        ctx.lineWidth = 2
        ctx.strokeRect(x, y, config.moduleWidthMm, config.moduleHeightMm)

        // Label modulo (se abbastanza zoomato)
        if (scale > 0.2) {
          ctx.fillStyle = '#8b8ba7'
          const fontSize = Math.max(12, 16 / scale)
          ctx.font = `${fontSize}px JetBrains Mono, monospace`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(
            `M${String(moduleIndex + 1).padStart(2, '0')}`,
            x + config.moduleWidthMm / 2,
            y + config.moduleHeightMm / 2
          )
        }
      }
    }

    ctx.restore()

    // Disegna dimensioni (fuori dalla trasformazione)
    ctx.fillStyle = '#8b8ba7'
    ctx.font = '14px JetBrains Mono, monospace'
    ctx.textAlign = 'center'

    // Larghezza (sopra)
    ctx.fillText(
      `${(config.widthMm / 1000).toFixed(2)}m`,
      canvas.width / 2,
      offsetY - 15
    )

    // Altezza (a destra)
    ctx.save()
    ctx.translate(offsetX + contentWidth + 20, canvas.height / 2)
    ctx.rotate(Math.PI / 2)
    ctx.fillText(`${(config.heightMm / 1000).toFixed(2)}m`, 0, 0)
    ctx.restore()
  }, [config, zoom, pan, calculateScale])

  // Handlers zoom/pan
  const handleZoomIn = () => setZoom((z) => Math.min(z * 1.25, 4))
  const handleZoomOut = () => setZoom((z) => Math.max(z / 1.25, 0.25))
  const handleReset = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  // Mouse drag per pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!interactive) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (!interactive) return
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom((z) => Math.max(0.25, Math.min(4, z * delta)))
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Zoom Controls */}
      {interactive && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleZoomOut}>
              <Minus className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleZoomIn}>
              <Plus className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
          <span className="text-sm text-muted-foreground font-mono">
            Zoom: {Math.round(zoom * 100)}%
          </span>
        </div>
      )}

      {/* Canvas Container */}
      <div
        ref={containerRef}
        className={cn(
          'relative border rounded-lg bg-background overflow-hidden',
          interactive && 'cursor-grab active:cursor-grabbing'
        )}
        style={{ minHeight: 400 }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full"
        />
      </div>

      {/* Specs Bar */}
      <div className="flex items-center justify-center gap-6 text-sm bg-muted/50 rounded-lg py-3 px-4">
        <div className="flex items-center gap-2">
          <Grid3x3 className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {config.modulesX * config.modulesY} moduli ({config.modulesX}×{config.modulesY})
          </span>
        </div>
        <Separator orientation="vertical" className="h-5" />
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            Pitch: P{(config.pixelPitchTenths / 10).toFixed(1)}
          </span>
        </div>
        <Separator orientation="vertical" className="h-5" />
        <div className="flex items-center gap-2">
          <Monitor className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {config.resolutionX}×{config.resolutionY} px
          </span>
        </div>
      </div>
    </div>
  )
}
```

---

## 14. State Management

### Strategia

| Tipo di stato | Dove gestirlo | Esempio |
|---------------|---------------|---------|
| **Server state** | TanStack Query | Prodotti, ordini, moduli |
| **Auth state** | Zustand (persist) | User, tokens |
| **Form state** | TanStack Form | Wizard configuratore |
| **UI state locale** | useState | Modal open, tab attivo |
| **URL state** | TanStack Router | Filtri, paginazione |

### stores/configStore.ts (Zustand per bozze)

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ConfigDraft {
  id: string
  name: string
  requestedWidthMm: number
  requestedHeightMm: number
  pixelPitchTenths: number
  selectedModuleId: string | null
  modulesX: number
  modulesY: number
  createdAt: string
  updatedAt: string
}

interface ConfigStore {
  drafts: ConfigDraft[]
  currentDraftId: string | null

  saveDraft: (draft: Omit<ConfigDraft, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateDraft: (id: string, updates: Partial<ConfigDraft>) => void
  deleteDraft: (id: string) => void
  loadDraft: (id: string) => ConfigDraft | undefined
  setCurrentDraft: (id: string | null) => void
}

export const useConfigStore = create<ConfigStore>()(
  persist(
    (set, get) => ({
      drafts: [],
      currentDraftId: null,

      saveDraft: (draft) => {
        const id = `draft_${Date.now()}`
        const now = new Date().toISOString()
        const newDraft: ConfigDraft = {
          ...draft,
          id,
          createdAt: now,
          updatedAt: now,
        }

        set((state) => ({
          drafts: [...state.drafts, newDraft],
          currentDraftId: id,
        }))

        return id
      },

      updateDraft: (id, updates) => {
        set((state) => ({
          drafts: state.drafts.map((d) =>
            d.id === id
              ? { ...d, ...updates, updatedAt: new Date().toISOString() }
              : d
          ),
        }))
      },

      deleteDraft: (id) => {
        set((state) => ({
          drafts: state.drafts.filter((d) => d.id !== id),
          currentDraftId: state.currentDraftId === id ? null : state.currentDraftId,
        }))
      },

      loadDraft: (id) => {
        return get().drafts.find((d) => d.id === id)
      },

      setCurrentDraft: (id) => {
        set({ currentDraftId: id })
      },
    }),
    {
      name: 'config-drafts',
    }
  )
)
```

---

## 15. API Client

### lib/api.ts

```typescript
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/authStore'

const API_URL = import.meta.env.VITE_API_URL || '/api/v1'

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - aggiungi token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = useAuthStore.getState()

    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - gestisci errori e refresh token
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    // Se 401 e non è già un retry, prova refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const { refreshToken, updateTokens, logout } = useAuthStore.getState()

      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          })

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            response.data

          updateTokens(newAccessToken, newRefreshToken)

          // Retry original request
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          }

          return api(originalRequest)
        } catch (refreshError) {
          // Refresh fallito, logout
          logout()
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      } else {
        logout()
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

// Helper per download file
export async function downloadFile(url: string, filename: string) {
  const response = await api.get(url, { responseType: 'blob' })

  const blob = new Blob([response.data])
  const downloadUrl = window.URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = filename
  link.click()

  window.URL.revokeObjectURL(downloadUrl)
}
```

---

## 16. Build e Deploy

### Build

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name b2b.example.com;
    root /var/www/ledwall-frontend/dist;
    index index.html;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Storage per PDF
    location /storage {
        alias /var/www/storage;
        expires 1d;
    }
}
```

### Environment Variables (.env.production)

```env
VITE_API_URL=https://api.b2b.example.com/api/v1
VITE_APP_NAME=LEDWall B2B
```

### Deploy Script

```bash
#!/bin/bash
# deploy-frontend.sh

echo "🚀 Deploying LEDWall Frontend..."

# Pull latest
git pull origin main

# Install
npm ci

# Build
npm run build

# Copy to nginx
sudo rm -rf /var/www/ledwall-frontend/dist
sudo cp -r dist /var/www/ledwall-frontend/

# Reload nginx
sudo nginx -s reload

echo "✅ Frontend deployed!"
```

---

## Checklist Implementazione

- [ ] Setup progetto Vite + React
- [ ] Configurazione Tailwind + shadcn/ui
- [ ] Setup TanStack Router
- [ ] Setup TanStack Query
- [ ] Implementazione Auth slice
- [ ] Implementazione Catalog slice
- [ ] Implementazione Standard Configurator slice
- [ ] Implementazione Custom Configurator slice
- [ ] Implementazione Orders slice
- [ ] Implementazione Admin slice
- [ ] Algoritmo configuratore frontend
- [ ] Componente LEDWall Preview
- [ ] Wizard multi-step
- [ ] Test manuali
- [ ] Build e deploy

---

*Documentazione Frontend - B2B LEDWall Configurator*
