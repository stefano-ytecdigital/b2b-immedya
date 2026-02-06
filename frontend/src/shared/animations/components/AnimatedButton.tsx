/**
 * AnimatedButton Component
 *
 * Enhanced button with micro-interactions.
 * Use this for primary CTAs, important actions.
 *
 * Features:
 * - Scale on hover
 * - Spring animation
 * - Tap feedback
 * - Respects reduced motion
 *
 * @example
 * <AnimatedButton>
 *   <Button variant="primary">
 *     Configura LEDWall
 *   </Button>
 * </AnimatedButton>
 */

import { motion } from 'framer-motion';
import { buttonVariants, buttonVariantsReduced } from '../variants';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface AnimatedButtonProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const AnimatedButton = ({
  children,
  className = '',
  disabled = false,
}: AnimatedButtonProps) => {
  const prefersReducedMotion = useReducedMotion();

  const variants = prefersReducedMotion ? buttonVariantsReduced : buttonVariants;

  return (
    <motion.div
      className={className}
      initial="rest"
      whileHover={!disabled ? 'hover' : undefined}
      whileTap={!disabled ? 'tap' : undefined}
      variants={variants}
      style={{
        display: 'inline-block',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </motion.div>
  );
};
