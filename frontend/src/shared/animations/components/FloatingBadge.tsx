/**
 * FloatingBadge Component
 *
 * Subtle floating animation for decorative elements.
 * Perfect for hero sections, feature highlights.
 *
 * @example
 * <FloatingBadge delay={0}>
 *   <Zap className="w-12 h-12 text-primary" />
 * </FloatingBadge>
 */

import { motion } from 'framer-motion';
import { floatingVariants } from '../variants';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { cn } from '@/shared/lib/utils';

interface FloatingBadgeProps {
  children: React.ReactNode;
  delay?: number; // Stagger delay
  duration?: number; // Float animation duration
  className?: string;
}

export const FloatingBadge = ({
  children,
  delay = 0,
  duration = 3,
  className = '',
}: FloatingBadgeProps) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn('inline-block', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <motion.div
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'easeInOut',
          delay,
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};
