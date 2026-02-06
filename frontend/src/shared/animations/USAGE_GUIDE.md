# Animation System - Usage Guide

## Overview

Sistema di animazioni premium per e-commerce B2B LEDWall.
Basato su Framer Motion con focus su performance, accessibility, DX.

**Features**:
- Scroll-triggered animations (useInView)
- Page transitions (TanStack Router compatible)
- Hover/tap micro-interactions
- Skeleton loaders
- Number counters
- Floating elements
- Reduced motion support (WCAG)
- Type-safe variants system

---

## Quick Start

### 1. Install Dependencies

```bash
npm install framer-motion
```

### 2. Import Animation Components

```tsx
import {
  AnimatedPage,
  AnimatedCard,
  AnimatedButton,
  SkeletonLoader,
  StatCounter,
} from '@/shared/animations';
```

---

## Common Use Cases

### Page Transitions

**TanStack Router Integration**:

```tsx
// routes/__root.tsx
import { AnimatePresence } from 'framer-motion';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <QueryClientProvider client={queryClient}>
        <div key={location.pathname}>
          <Outlet />
        </div>
      </QueryClientProvider>
    </AnimatePresence>
  );
}
```

**Page Component**:

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

---

### Product Card with Hover

**KitCard Component**:

```tsx
import { AnimatedCard } from '@/shared/animations';
import { Card, CardHeader, CardContent } from '@/shared/components/ui/card';

export const KitCard = ({ kit, onClick }) => (
  <AnimatedCard onClick={onClick}>
    <Card>
      <CardHeader>
        <h3>{kit.name}</h3>
      </CardHeader>
      <CardContent>
        <img src={kit.image} alt={kit.name} />
        <p>{kit.description}</p>
        <span className="font-mono">{kit.price}€</span>
      </CardContent>
    </Card>
  </AnimatedCard>
);
```

**Result**: Card fades in on scroll, lifts on hover with shadow glow.

---

### Product Grid with Stagger

**KitGrid Component**:

```tsx
import { AnimatedCard, GridSkeleton } from '@/shared/animations';

export const KitGrid = () => {
  const { data: kits, isLoading } = useQuery({ ... });

  if (isLoading) return <GridSkeleton count={6} />;

  return (
    <div className="grid grid-cols-3 gap-6">
      {kits.map((kit, index) => (
        <AnimatedCard key={kit.id} delay={index * 0.1}>
          <KitCard kit={kit} />
        </AnimatedCard>
      ))}
    </div>
  );
};
```

**Result**: Cards fade in sequentially (masonry effect).

---

### Button with Micro-interactions

```tsx
import { AnimatedButton } from '@/shared/animations';
import { Button } from '@/shared/components/ui/button';

export const CTAButton = () => (
  <AnimatedButton>
    <Button variant="default" size="lg">
      Configura LEDWall
    </Button>
  </AnimatedButton>
);
```

**Result**: Button scales on hover with spring physics.

---

### Hero Section with Stats

```tsx
import { StatCounter, StatCounterGroup, FloatingBadge } from '@/shared/animations';
import { Zap, Shield, Award } from 'lucide-react';

export const HeroSection = () => (
  <section className="relative min-h-screen flex items-center">
    {/* Background gradient (CSS) */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-slate-900 to-slate-800" />

    {/* Content */}
    <div className="relative z-10 container mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h1 className="text-6xl font-bold mb-4">
          Configura il tuo LEDWall
        </h1>
        <p className="text-xl text-muted-foreground">
          In meno di 5 minuti
        </p>
      </motion.div>

      {/* Stats */}
      <StatCounterGroup className="mt-16">
        <StatCounter end={150} label="Kit disponibili" />
        <StatCounter end={5000} label="Configurazioni create" suffix="+" />
        <StatCounter end={98} label="Clienti soddisfatti" suffix="%" />
      </StatCounterGroup>

      {/* Floating badges */}
      <div className="absolute top-20 right-20">
        <FloatingBadge delay={0}>
          <div className="bg-primary/10 p-4 rounded-full">
            <Zap className="w-12 h-12 text-primary" />
          </div>
        </FloatingBadge>
      </div>

      <div className="absolute bottom-20 left-20">
        <FloatingBadge delay={0.5}>
          <div className="bg-accent/10 p-4 rounded-full">
            <Shield className="w-12 h-12 text-accent" />
          </div>
        </FloatingBadge>
      </div>
    </div>
  </section>
);
```

---

### Loading States

**With Skeleton**:

```tsx
import { GridSkeleton } from '@/shared/animations';

export const ProductList = () => {
  const { data, isLoading } = useQuery({ ... });

  if (isLoading) {
    return <GridSkeleton count={6} />;
  }

  return <ProductGrid data={data} />;
};
```

**Custom Skeleton**:

```tsx
import { SkeletonLoader } from '@/shared/animations';

export const CardSkeleton = () => (
  <div className="space-y-3 p-4 border rounded-lg">
    <SkeletonLoader className="h-48 w-full" />
    <SkeletonLoader className="h-4 w-3/4" />
    <SkeletonLoader className="h-4 w-1/2" />
  </div>
);
```

---

### Custom Scroll Animation

**Manual Control**:

```tsx
import { useScrollAnimation, cardVariants } from '@/shared/animations';
import { motion } from 'framer-motion';

export const CustomComponent = () => {
  const { ref, isInView } = useScrollAnimation({ once: true });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={cardVariants}
    >
      Custom content
    </motion.div>
  );
};
```

---

## Performance Best Practices

### 1. Lazy Load Heavy Animations

```tsx
import { lazy, Suspense } from 'react';

const HeavyAnimation = lazy(() => import('./HeavyAnimation'));

export const Page = () => (
  <Suspense fallback={<SkeletonLoader />}>
    <HeavyAnimation />
  </Suspense>
);
```

### 2. Limit Stagger for Large Lists

```tsx
// ❌ Bad: All 100 items staggered (10s total delay)
{items.map((item, i) => (
  <AnimatedCard delay={i * 0.1} />
))}

// ✅ Good: Limit stagger to first 10 items
{items.map((item, i) => (
  <AnimatedCard delay={Math.min(i, 10) * 0.1} />
))}
```

### 3. Use `once: true` for Scroll Animations

```tsx
// Prevent re-trigger on scroll up (performance gain)
useScrollAnimation({ once: true })
```

### 4. Disable Animations for Reduced Motion

All components automatically respect `prefers-reduced-motion`.
No extra code needed.

---

## Accessibility

### Reduced Motion Support

**Automatic**: All animation components use `useReducedMotion` hook.

**Manual Check**:

```tsx
import { useReducedMotion } from '@/shared/animations';

const prefersReducedMotion = useReducedMotion();
const variants = prefersReducedMotion ? variantsReduced : variantsFull;
```

### Keyboard Navigation

Ensure focus states are visible:

```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileFocus={{ scale: 1.05 }} // Add focus state
>
  Click me
</motion.button>
```

---

## Testing Animations

### Visual Regression Testing

Use Playwright + Chromatic for animation snapshots.

### Performance Testing

```bash
# Run Lighthouse audit
npm run build
npx lighthouse http://localhost:4173 --view
```

**Target Metrics**:
- Performance: >90
- First Contentful Paint: <1.5s
- Time to Interactive: <3.5s

---

## Customization

### Override Variants

```tsx
import { cardVariants } from '@/shared/animations';

const customVariants = {
  ...cardVariants,
  hover: {
    ...cardVariants.hover,
    scale: 1.05, // More aggressive hover
  },
};

<motion.div variants={customVariants} />
```

### Custom Easing

```tsx
import { EASE_OUT_CUBIC } from '@/shared/animations';

const customTransition = {
  duration: 0.5,
  ease: EASE_OUT_CUBIC,
};
```

---

## Troubleshooting

### Animations Not Working

1. Check Framer Motion installed: `npm list framer-motion`
2. Verify import paths: `@/shared/animations`
3. Ensure `AnimatePresence` wraps route outlet
4. Check browser console for errors

### Performance Issues

1. Limit simultaneous animations (max 10-15)
2. Use `once: true` for scroll animations
3. Check if animating layout properties (use transform instead)
4. Profile with Chrome DevTools Performance tab

### Layout Shifts

```tsx
// Add explicit dimensions to prevent CLS
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  style={{ minHeight: '200px' }} // Reserve space
>
```

---

## Advanced Patterns

### Orchestrated Animations

```tsx
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

<motion.div variants={containerVariants} initial="hidden" animate="visible">
  <motion.div variants={itemVariants}>Item 1</motion.div>
  <motion.div variants={itemVariants}>Item 2</motion.div>
  <motion.div variants={itemVariants}>Item 3</motion.div>
</motion.div>
```

### Gesture Animations

```tsx
import { motion } from 'framer-motion';

<motion.div
  drag
  dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
  dragElastic={0.2}
  whileDrag={{ scale: 1.1 }}
>
  Draggable element
</motion.div>
```

---

## Resources

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Animation Best Practices](https://web.dev/animations/)
- [WCAG Motion Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html)

---

**Maintainer**: Claude Code
**Last Updated**: 2026-02-06
