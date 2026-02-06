/**
 * useScrollAnimation Hook
 *
 * Simplifies scroll-triggered animations with Framer Motion useInView.
 * Automatically handles visibility detection and animation state.
 *
 * @param {Object} options - Configuration options
 * @param {boolean} options.once - Only trigger animation once (default: true)
 * @param {string} options.margin - Margin for early trigger (default: "-100px")
 * @param {number} options.amount - Visibility threshold 0-1 (default: 0.2)
 *
 * @returns {Object} { ref, isInView, controls }
 *
 * @example
 * const { ref, isInView } = useScrollAnimation();
 *
 * <motion.div
 *   ref={ref}
 *   initial={{ opacity: 0, y: 50 }}
 *   animate={isInView ? { opacity: 1, y: 0 } : {}}
 * >
 *   Content
 * </motion.div>
 */

import { useRef } from 'react';
import { useInView, useAnimation } from 'framer-motion';

interface UseScrollAnimationOptions {
  once?: boolean;
  margin?: string;
  amount?: number;
}

export function useScrollAnimation({
  once = true,
  margin = '-100px',
  amount = 0.2,
}: UseScrollAnimationOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin, amount });
  const controls = useAnimation();

  // Trigger animation when in view
  if (isInView) {
    controls.start('visible');
  }

  return {
    ref,
    isInView,
    controls,
  };
}
