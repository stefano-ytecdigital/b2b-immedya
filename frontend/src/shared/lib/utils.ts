import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for merging Tailwind CSS classes with clsx
 * Used throughout shadcn/ui components
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency (cents to euros)
 */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

/**
 * Format date (ISO to Italian locale)
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('it-IT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

/**
 * Format date short (ISO to dd/mm/yyyy)
 */
export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('it-IT', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date));
}
