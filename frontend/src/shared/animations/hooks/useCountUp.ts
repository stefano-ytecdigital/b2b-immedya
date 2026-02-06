/**
 * useCountUp Hook
 *
 * Animates number counting from 0 to target value.
 * Perfect for stats, pricing, dashboard metrics.
 *
 * @param {number} end - Target number to count to
 * @param {Object} options - Configuration options
 * @param {number} options.duration - Animation duration in seconds (default: 2)
 * @param {boolean} options.startOnMount - Start counting on mount (default: false)
 *
 * @returns {Object} { count, start, reset }
 *
 * @example
 * const { count, start } = useCountUp(5000, { duration: 2 });
 *
 * useEffect(() => {
 *   if (isInView) start();
 * }, [isInView]);
 *
 * <span>{Math.floor(count)}</span>
 */

import { useEffect, useState, useRef } from 'react';

interface UseCountUpOptions {
  duration?: number;
  startOnMount?: boolean;
}

export function useCountUp(
  end: number,
  { duration = 2, startOnMount = false }: UseCountUpOptions = {}
) {
  const [count, setCount] = useState(0);
  const [isRunning, setIsRunning] = useState(startOnMount);
  const startTime = useRef<number | null>(null);
  const animationFrame = useRef<number | null>(null);

  const easeOutCubic = (t: number): number => {
    return 1 - Math.pow(1 - t, 3);
  };

  const start = () => {
    setCount(0);
    setIsRunning(true);
    startTime.current = null;
  };

  const reset = () => {
    setCount(0);
    setIsRunning(false);
    startTime.current = null;
    if (animationFrame.current) {
      cancelAnimationFrame(animationFrame.current);
    }
  };

  useEffect(() => {
    if (!isRunning) return;

    const animate = (timestamp: number) => {
      if (!startTime.current) {
        startTime.current = timestamp;
      }

      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const easedProgress = easeOutCubic(progress);

      setCount(easedProgress * end);

      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(animate);
      } else {
        setIsRunning(false);
      }
    };

    animationFrame.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [isRunning, end, duration]);

  return { count, start, reset };
}
