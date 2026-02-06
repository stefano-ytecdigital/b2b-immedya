/**
 * SkeletonLoader Component
 *
 * Animated skeleton placeholder for loading states.
 * Better UX than spinners - shows content structure.
 *
 * @example
 * // Card skeleton
 * <SkeletonLoader className="h-64 w-full rounded-lg" />
 *
 * // Text skeleton
 * <SkeletonLoader className="h-4 w-3/4" />
 */

import { motion } from 'framer-motion';
import { skeletonVariants } from '../variants';
import { cn } from '@/shared/lib/utils';

interface SkeletonLoaderProps {
  className?: string;
}

export const SkeletonLoader = ({ className }: SkeletonLoaderProps) => {
  return (
    <motion.div
      className={cn(
        'bg-muted rounded-md',
        'relative overflow-hidden',
        className
      )}
      variants={skeletonVariants}
      animate="pulse"
    >
      {/* Shimmer effect overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-background/50 to-transparent"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </motion.div>
  );
};

/**
 * Pre-composed skeleton layouts
 */

export const CardSkeleton = () => (
  <div className="space-y-3 p-4 border rounded-lg">
    <SkeletonLoader className="h-48 w-full" />
    <SkeletonLoader className="h-4 w-3/4" />
    <SkeletonLoader className="h-4 w-1/2" />
    <div className="flex gap-2 mt-4">
      <SkeletonLoader className="h-8 w-20" />
      <SkeletonLoader className="h-8 w-20" />
    </div>
  </div>
);

export const TextSkeleton = () => (
  <div className="space-y-2">
    <SkeletonLoader className="h-4 w-full" />
    <SkeletonLoader className="h-4 w-5/6" />
    <SkeletonLoader className="h-4 w-4/6" />
  </div>
);

export const GridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, index) => (
      <CardSkeleton key={index} />
    ))}
  </div>
);
