# B2B LEDWall Platform - Frontend

## Stack

Vite + React + TypeScript + TanStack Router + TanStack Query + Zustand + shadcn/ui

## Design System Custom

- **Fonts**: Space Grotesk (UI) + JetBrains Mono (data tecnici)
- **Colors**: Amber primary + Dark Slate bg (industrial premium look)

## Setup

```bash
npm install
npm run dev
```

Apri `http://localhost:5173`

## Login Test

Backend running required. Credentials: `partner@test.com` (da seed) o Google OAuth.

## Stato

✅ **Fase 1-2 COMPLETATO** (Design system + Auth + Layout + Routes)
🚧 **Prossimo**: Catalog grid, Wizard, Dashboard

## Architettura

Feature-based (vertical slicing):
- `features/auth` - Login, token refresh
- `features/catalog` - Kit browsing
- `features/standard-configurator` - Wizard
- `features/dashboard` - Quotes

Routes protette: `/_authenticated/*`
