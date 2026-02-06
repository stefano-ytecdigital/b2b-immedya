/**
 * Animation System Exports
 *
 * Centralized export file for all animation utilities.
 * Import from here for consistent usage across the app.
 *
 * @example
 * import {
 *   AnimatedCard,
 *   cardVariants,
 *   useScrollAnimation,
 *   SPRING_SMOOTH
 * } from '@/shared/animations';
 */

// Constants
export * from './constants';

// Variants
export * from './variants';

// Hooks
export { useReducedMotion } from './hooks/useReducedMotion';
export { useScrollAnimation } from './hooks/useScrollAnimation';
export { useCountUp } from './hooks/useCountUp';

// Components
export { AnimatedPage } from './components/AnimatedPage';
export { AnimatedCard } from './components/AnimatedCard';
export { AnimatedButton } from './components/AnimatedButton';
export {
  SkeletonLoader,
  CardSkeleton,
  TextSkeleton,
  GridSkeleton,
} from './components/SkeletonLoader';
export { StatCounter, StatCounterGroup } from './components/StatCounter';
export { FloatingBadge } from './components/FloatingBadge';
