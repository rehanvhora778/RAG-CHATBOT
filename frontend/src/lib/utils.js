import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * cn — merge conditional class names and de-dupe conflicting Tailwind classes.
 * Used by every UI primitive so variants/overrides compose cleanly.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
