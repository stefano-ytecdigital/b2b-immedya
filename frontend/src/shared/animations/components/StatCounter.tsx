/**
 * StatCounter Component
 *
 * Animated number counter for stats, metrics, pricing.
 * Auto-starts when scrolled into view.
 *
 * Features:
 * - Eased counting animation
 * - Scroll-triggered
 * - Number formatting (K, M suffixes)
 * - Currency support
 *
 * @example
 * <StatCounter
 *   end={5000}
 *   label="Configurazioni create"
 *   duration={2}
 *   suffix="+"
 * />
 */

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCountUp } from '../hooks/useCountUp';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { cn } from '@/shared/lib/utils';

interface StatCounterProps {
  end: number;
  label: string;
  duration?: number;
  prefix?: string; // e.g., "$", "€"
  suffix?: string; // e.g., "+", "%", "K"
  decimals?: number; // Decimal places (default: 0)
  className?: string;
}

export const StatCounter = ({
  end,
  label,
  duration = 2,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}: StatCounterProps) => {
  const { ref, isInView } = useScrollAnimation({ once: true });
  const { count, start } = useCountUp(end, { duration });

  useEffect(() => {
    if (isInView) {
      start();
    }
  }, [isInView, start]);

  const formatNumber = (num: number): string => {
    return num.toFixed(decimals);
  };

  return (
    <motion.div
      ref={ref}
      className={cn('text-center', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
    >
      <div className="text-4xl font-bold font-mono text-primary">
        {prefix}
        {formatNumber(count)}
        {suffix}
      </div>
      <div className="text-sm text-muted-foreground mt-2">{label}</div>
    </motion.div>
  );
};

/**
 * StatCounterGroup Component
 *
 * Group multiple stat counters with stagger animation.
 *
 * @example
 * <StatCounterGroup>
 *   <StatCounter end={150} label="Kit disponibili" />
 *   <StatCounter end={5000} label="Configurazioni" suffix="+" />
 *   <StatCounter end={98} label="Soddisfazione" suffix="%" />
 * </StatCounterGroup>
 */

interface StatCounterGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const StatCounterGroup = ({ children, className = '' }: StatCounterGroupProps) => {
  return (
    <div className={cn('flex flex-wrap gap-8 justify-center', className)}>
      {children}
    </div>
  );
};
