/**
 * AnimatedPage Component
 *
 * Wrapper for page-level route transitions.
 * Use this as parent of route components for consistent page animations.
 *
 * @example
 * // In route component
 * export const CatalogPage = () => (
 *   <AnimatedPage>
 *     <h1>Catalog</h1>
 *     ...
 *   </AnimatedPage>
 * );
 */

import { motion } from 'framer-motion';
import { pageVariants } from '../variants';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface AnimatedPageProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedPage = ({ children, className = '' }: AnimatedPageProps) => {
  const prefersReducedMotion = useReducedMotion();

  // Skip animations if user prefers reduced motion
  const variants = prefersReducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : pageVariants;

  return (
    <motion.div
      className={className}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
    >
      {children}
    </motion.div>
  );
};
