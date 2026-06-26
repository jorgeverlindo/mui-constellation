import { clsx, type ClassValue } from 'clsx';

// Tailwind-free cn() — clsx only (no tailwind-merge dependency).
// MUI components use sx/styled, not className merging, so tailwind-merge is not needed.
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
