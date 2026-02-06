/**
 * Animation Constants
 *
 * Centralized configuration for all animations.
 * Ensures consistency across the application.
 */

// Easing Functions (Cubic Bezier)
export const EASE_IN_OUT_CUBIC = [0.645, 0.045, 0.355, 1.0];
export const EASE_OUT_CUBIC = [0.215, 0.61, 0.355, 1.0];
export const EASE_IN_CUBIC = [0.55, 0.055, 0.675, 0.19];
export const EASE_OUT_EXPO = [0.19, 1.0, 0.22, 1.0];

// Spring Configurations
export const SPRING_SMOOTH = {
  type: 'spring' as const,
  stiffness: 260,
  damping: 20,
};

export const SPRING_BOUNCY = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 15,
};

export const SPRING_STIFF = {
  type: 'spring' as const,
  stiffness: 500,
  damping: 30,
};

// Duration Constants (in seconds)
export const DURATION_INSTANT = 0.15;
export const DURATION_FAST = 0.3;
export const DURATION_NORMAL = 0.5;
export const DURATION_SLOW = 0.7;

// Stagger Delays (for list animations)
export const STAGGER_DELAY_SHORT = 0.05;
export const STAGGER_DELAY_NORMAL = 0.1;
export const STAGGER_DELAY_LONG = 0.15;

// Scroll Animation Thresholds
export const SCROLL_MARGIN = '-100px'; // Pre-trigger animations
export const SCROLL_AMOUNT = 0.2; // 20% visible triggers animation

// Z-Index Layers
export const Z_INDEX_MODAL = 50;
export const Z_INDEX_DROPDOWN = 40;
export const Z_INDEX_STICKY = 30;
export const Z_INDEX_CARD_HOVER = 10;

// Shadow Presets (for hover effects)
export const SHADOW_CARD_HOVER = '0 20px 60px rgba(62, 165, 249, 0.3)';
export const SHADOW_CARD_ELEVATED = '0 30px 80px rgba(62, 165, 249, 0.4)';
export const SHADOW_GLOW = '0 0 30px rgba(62, 165, 249, 0.5)';
