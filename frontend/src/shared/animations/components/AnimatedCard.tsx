/**
 * AnimatedCard Component
 *
 * Reusable card wrapper with hover animations.
 * Perfect for product cards, kit cards, info cards.
 *
 * Features:
 * - Scroll-triggered fade-in
 * - Hover lift effect
 * - Tap feedback
 * - Respects reduced motion preferences
 * - Optional onClick handler
 *
 * @example
 * <AnimatedCard onClick={handleClick}>
 *   <Card>
 *     <CardHeader>...</CardHeader>
 *     <CardContent>...</CardContent>
 *   </Card>
 * </AnimatedCard>
 */

import { motion } from 'framer-motion';
import { cardVariants, cardVariantsReduced } from '../variants';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  delay?: number; // For staggered animations
  disableHover?: boolean; // Disable hover effects
  disableScrollAnimation?: boolean; // Disable scroll-triggered animation
}

export const AnimatedCard = ({
  children,
  className = '',
  onClick,
  delay = 0,
  disableHover = false,
  disableScrollAnimation = false,
}: AnimatedCardProps) => {
  const prefersReducedMotion = useReducedMotion();
  const { ref, isInView } = useScrollAnimation({
    once: true,
    margin: '-100px',
    amount: 0.2,
  });

  const variants = prefersReducedMotion ? cardVariantsReduced : cardVariants;

  const initialState = disableScrollAnimation ? 'visible' : 'hidden';
  const animateState = disableScrollAnimation || isInView ? 'visible' : 'hidden';

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={initialState}
      animate={animateState}
      whileHover={!disableHover && !prefersReducedMotion ? 'hover' : undefined}
      whileTap={!disableHover ? 'tap' : undefined}
      variants={variants}
      transition={{
        delay,
      }}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {children}
    </motion.div>
  );
};
