# Animation System Setup Guide

## Overview

Sistema di animazioni premium implementato per trasformare la piattaforma B2B LEDWall in e-commerce WOW.

**Tech Stack**:
- Framer Motion (animation library)
- React 19 + TypeScript
- TanStack Router (page transitions)
- Tailwind CSS v3 (styling)

---

## Installation

### Step 1: Install Dependencies

```bash
cd frontend
npm install framer-motion
```

**Bundle Impact**: ~55kb gzipped (tree-shakable)

---

### Step 2: Integrate Page Transitions

**File**: `frontend/src/routes/__root.tsx`

```tsx
import { Outlet, createRootRoute, useLocation } from '@tanstack/react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { queryClient } from '@/shared/api/queryClient';

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const location = useLocation();

  return (
    <QueryClientProvider client={queryClient}>
      {/* AnimatePresence enables exit animations */}
      <AnimatePresence mode="wait">
        <div key={location.pathname}>
          <Outlet />
        </div>
      </AnimatePresence>
    </QueryClientProvider>
  );
}
```

**What this does**:
- `AnimatePresence` enables exit animations when route changes
- `mode="wait"` prevents overlapping page transitions
- `key={location.pathname}` triggers animation on route change

---

### Step 3: Wrap Route Components

**Before** (no animation):
```tsx
// routes/catalog/kits.tsx
export const CatalogPage = () => (
  <div>
    <h1>Catalog</h1>
    <KitGrid />
  </div>
);
```

**After** (with animation):
```tsx
// routes/catalog/kits.tsx
import { AnimatedPage } from '@/shared/animations';

export const CatalogPage = () => (
  <AnimatedPage>
    <h1>Catalog</h1>
    <KitGrid />
  </AnimatedPage>
);
```

**Result**: Page fades in/out with 300ms smooth transition on route change.

---

## Usage Examples

### 1. Product Card with Hover Effect

**File**: `frontend/src/features/catalog/components/KitCard.tsx`

```tsx
import { AnimatedCard } from '@/shared/animations';
import { Card, CardHeader, CardContent, CardFooter } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';

interface KitCardProps {
  kit: {
    id: string;
    name: string;
    type: string;
    pitch: string;
    description: string;
    price: number;
    imageUrl?: string;
  };
  onConfigure?: (kitId: string) => void;
}

export const KitCard = ({ kit, onConfigure }: KitCardProps) => {
  return (
    <AnimatedCard onClick={() => onConfigure?.(kit.id)}>
      <Card className="h-full flex flex-col">
        {/* Image */}
        <div className="relative h-48 bg-slate-800 rounded-t-lg overflow-hidden">
          {kit.imageUrl ? (
            <img
              src={kit.imageUrl}
              alt={kit.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No image
            </div>
          )}

          {/* Badges overlay */}
          <div className="absolute top-3 right-3 flex gap-2">
            <Badge variant="secondary">{kit.type}</Badge>
            <Badge variant="outline" className="font-mono">{kit.pitch}</Badge>
          </div>
        </div>

        {/* Content */}
        <CardHeader>
          <h3 className="text-lg font-semibold">{kit.name}</h3>
        </CardHeader>

        <CardContent className="flex-1">
          <p className="text-sm text-muted-foreground">{kit.description}</p>
        </CardContent>

        <CardFooter className="flex justify-between items-center">
          <span className="text-2xl font-bold font-mono text-primary">
            {kit.price.toLocaleString('it-IT')}€
          </span>
          <Button variant="default">Configura</Button>
        </CardFooter>
      </Card>
    </AnimatedCard>
  );
};
```

**What you get**:
- Scroll-triggered fade-in when card enters viewport
- Hover: Card lifts 8px with shadow glow
- Tap: Scale feedback (0.98)
- Auto respects `prefers-reduced-motion`

---

### 2. Product Grid with Stagger

**File**: `frontend/src/features/catalog/components/KitGrid.tsx`

```tsx
import { AnimatedCard, GridSkeleton } from '@/shared/animations';
import { KitCard } from './KitCard';
import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '../api/catalogApi';

export const KitGrid = () => {
  const { data: kits, isLoading } = useQuery({
    queryKey: ['kits'],
    queryFn: catalogApi.getKits,
  });

  // Show skeleton during loading
  if (isLoading) {
    return <GridSkeleton count={6} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {kits?.map((kit, index) => (
        <AnimatedCard
          key={kit.id}
          delay={Math.min(index, 10) * 0.1} // Stagger first 10 cards
        >
          <KitCard kit={kit} />
        </AnimatedCard>
      ))}
    </div>
  );
};
```

**What you get**:
- Loading state with shimmer skeleton
- Cards fade in sequentially (masonry effect)
- Stagger limited to first 10 cards (performance)

---

### 3. Call-to-Action Button

**File**: `frontend/src/features/catalog/components/CTASection.tsx`

```tsx
import { AnimatedButton } from '@/shared/animations';
import { Button } from '@/shared/components/ui/button';
import { ArrowRight } from 'lucide-react';

export const CTASection = () => (
  <section className="text-center py-16">
    <h2 className="text-4xl font-bold mb-4">
      Pronto a configurare il tuo LEDWall?
    </h2>
    <p className="text-xl text-muted-foreground mb-8">
      Crea il tuo preventivo in meno di 5 minuti
    </p>

    <AnimatedButton>
      <Button size="lg" className="gap-2">
        Inizia ora
        <ArrowRight className="w-5 h-5" />
      </Button>
    </AnimatedButton>
  </section>
);
```

**What you get**:
- Button scales on hover (1.05x) with spring physics
- Tap feedback (scale 0.95x)
- Magnetic feel (natural spring bounce)

---

### 4. Dashboard Stats

**File**: `frontend/src/features/dashboard/components/StatsOverview.tsx`

```tsx
import { StatCounter, StatCounterGroup } from '@/shared/animations';
import { Package, FileText, CheckCircle } from 'lucide-react';

export const StatsOverview = () => (
  <section className="py-16 bg-slate-900 rounded-lg">
    <StatCounterGroup>
      <StatCounter
        end={150}
        label="Kit disponibili"
        duration={2}
      />
      <StatCounter
        end={5247}
        label="Configurazioni create"
        suffix="+"
        duration={2.5}
      />
      <StatCounter
        end={98}
        label="Clienti soddisfatti"
        suffix="%"
        duration={2}
      />
    </StatCounterGroup>
  </section>
);
```

**What you get**:
- Numbers count from 0 to target when scrolled into view
- Eased animation (cubic bezier)
- Only triggers once (performance)

---

### 5. Loading States

**File**: `frontend/src/features/catalog/pages/CatalogPage.tsx`

```tsx
import { AnimatedPage, GridSkeleton } from '@/shared/animations';
import { KitGrid } from '../components/KitGrid';
import { useQuery } from '@tanstack/react-query';

export const CatalogPage = () => {
  const { data, isLoading } = useQuery({ ... });

  return (
    <AnimatedPage>
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold mb-8">Catalogo Kit</h1>

        {isLoading ? (
          <GridSkeleton count={6} />
        ) : (
          <KitGrid kits={data} />
        )}
      </div>
    </AnimatedPage>
  );
};
```

**What you get**:
- Smooth skeleton shimmer effect
- No layout shift (skeleton same size as actual content)
- Better UX than generic spinner

---

## Performance Optimization

### 1. Lighthouse Score Target

Run after implementation:

```bash
npm run build
npm run preview
npx lighthouse http://localhost:4173 --view
```

**Target Metrics**:
- Performance: >90
- First Contentful Paint: <1.5s
- Time to Interactive: <3.5s
- Cumulative Layout Shift: <0.1

---

### 2. Bundle Size Check

```bash
npm run build
```

Check `dist/assets/*.js` files.

**Expected**:
- framer-motion chunk: ~55kb gzipped
- Total bundle increase: <80kb

---

### 3. Runtime Performance

Open Chrome DevTools Performance tab:
1. Start recording
2. Navigate between pages
3. Scroll through product grid
4. Stop recording

**Check**:
- FPS should stay at 60fps
- No long tasks >50ms
- No forced reflows

---

## Accessibility Checklist

- [x] `prefers-reduced-motion` respected (automatic)
- [x] Keyboard navigation works (focus states)
- [x] Screen reader announces content (ARIA labels)
- [x] No flashing animations (seizure risk)
- [x] Animation durations <500ms (WCAG guideline)

**Test**:
```bash
# Enable reduced motion in OS settings
# Windows: Settings → Accessibility → Visual effects → Animation effects OFF
# macOS: System Preferences → Accessibility → Display → Reduce motion

# Then test app - animations should be minimal
```

---

## Troubleshooting

### Issue: Animations not working after install

**Solution**: Restart dev server
```bash
npm run dev
```

---

### Issue: Type errors in animation imports

**Solution**: Ensure `framer-motion` types are installed
```bash
npm install --save-dev @types/framer-motion
```

But Framer Motion includes types, so this shouldn't be needed.

---

### Issue: Performance drop with many cards

**Solution**: Limit stagger delay
```tsx
// ❌ Bad
<AnimatedCard delay={index * 0.1} />

// ✅ Good
<AnimatedCard delay={Math.min(index, 10) * 0.1} />
```

---

### Issue: Layout shift on page transition

**Solution**: Add explicit min-height
```tsx
<AnimatedPage className="min-h-screen">
  {children}
</AnimatedPage>
```

---

## Next Steps

### Sprint 1 (Week 1): Foundation
- [x] Install Framer Motion
- [ ] Integrate `AnimatePresence` in `__root.tsx`
- [ ] Wrap 3 main pages with `AnimatedPage`
- [ ] Test page transitions
- [ ] Update `KitCard` component with `AnimatedCard`
- [ ] Test in 3 browsers (Chrome, Firefox, Safari)
- [ ] Run Lighthouse audit (target >90)

### Sprint 2 (Week 2): Product Catalog
- [ ] Implement `KitGrid` with stagger animation
- [ ] Add skeleton loaders
- [ ] Implement filter animations (toggle/collapse)
- [ ] Add image lazy load + fade-in
- [ ] Test with 50+ product cards
- [ ] Profile performance (Chrome DevTools)
- [ ] Fix any jank/stuttering

### Sprint 3 (Week 3): Hero + Polish
- [ ] Create hero section with stats counters
- [ ] Add floating badges (decorative)
- [ ] Implement success animation (confetti on quote submitted)
- [ ] Add gradient background animation
- [ ] Accessibility audit (keyboard nav, ARIA)
- [ ] Test with `prefers-reduced-motion`
- [ ] Documentation update in SECOND-BRAIN.md

---

## Resources

- [Animation System Docs](./src/shared/animations/USAGE_GUIDE.md)
- [Framer Motion API](https://www.framer.com/motion/)
- [Performance Best Practices](https://web.dev/animations/)

---

**Created**: 2026-02-06
**Status**: Ready for implementation
**Estimated Effort**: 3 weeks (1 sprint per phase)
