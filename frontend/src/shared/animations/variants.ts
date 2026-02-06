/**
 * Animation Variants
 *
 * Centralized Framer Motion variants for consistent animations.
 * Import and use these variants across components.
 */

import type { Variant, Transition } from 'framer-motion';
import {
  DURATION_FAST,
  DURATION_NORMAL,
  EASE_OUT_CUBIC,
  SHADOW_CARD_HOVER,
  SPRING_SMOOTH,
  SPRING_BOUNCY,
  STAGGER_DELAY_NORMAL,
} from './constants';

// Variants type for Framer Motion v12+
type Variants = {
  [key: string]: Variant;
};

// =====================================
// PAGE TRANSITIONS
// =====================================

export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION_FAST,
      ease: EASE_OUT_CUBIC,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: DURATION_FAST,
      ease: EASE_OUT_CUBIC,
    },
  },
};

// =====================================
// CARD ANIMATIONS
// =====================================

export const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: DURATION_NORMAL,
      ease: EASE_OUT_CUBIC,
    },
  },
  hover: {
    y: -8,
    scale: 1.02,
    boxShadow: SHADOW_CARD_HOVER,
    transition: SPRING_SMOOTH,
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
    },
  },
};

// Variant ridotta per prefers-reduced-motion
export const cardVariantsReduced: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATION_FAST } },
  hover: { opacity: 0.9 },
  tap: { opacity: 0.8 },
};

// =====================================
// BUTTON ANIMATIONS
// =====================================

export const buttonVariants: Variants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: SPRING_BOUNCY,
  },
  tap: {
    scale: 0.95,
    transition: {
      duration: 0.1,
    },
  },
};

export const buttonVariantsReduced: Variants = {
  rest: { opacity: 1 },
  hover: { opacity: 0.9 },
  tap: { opacity: 0.8 },
};

// =====================================
// STAGGERED LIST ANIMATIONS
// =====================================

export const listContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: STAGGER_DELAY_NORMAL,
      delayChildren: 0.1,
    },
  },
};

export const listItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION_FAST,
      ease: EASE_OUT_CUBIC,
    },
  },
};

// =====================================
// MODAL ANIMATIONS
// =====================================

export const modalBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: DURATION_FAST },
  },
};

export const modalContentVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: DURATION_FAST,
      ease: EASE_OUT_CUBIC,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

// =====================================
// TEXT REVEAL ANIMATIONS
// =====================================

export const textRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION_NORMAL,
      ease: EASE_OUT_CUBIC,
    },
  },
};

export const textContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

// =====================================
// INPUT ANIMATIONS
// =====================================

export const inputFocusVariants: Variants = {
  unfocused: {
    scale: 1,
    borderColor: 'hsl(var(--border))',
  },
  focused: {
    scale: 1.01,
    borderColor: 'hsl(var(--primary))',
    boxShadow: '0 0 0 3px rgba(62, 165, 249, 0.1)',
    transition: SPRING_SMOOTH,
  },
};

// =====================================
// SKELETON LOADER ANIMATION
// =====================================

export const skeletonVariants: Variants = {
  pulse: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// =====================================
// BADGE / FLOATING ELEMENT
// =====================================

export const floatingVariants: Variants = {
  float: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// =====================================
// IMAGE ANIMATIONS
// =====================================

export const imageVariants: Variants = {
  hidden: { opacity: 0, scale: 1.1 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: DURATION_NORMAL,
      ease: EASE_OUT_CUBIC,
    },
  },
  hover: {
    scale: 1.05,
    transition: SPRING_SMOOTH,
  },
};
