// NOTE: Original source imported clsx/tailwind-merge for the `cn` utility function.
// That shadcn/ui utility has been removed — these are pure data/utility functions only.

export function cn(..._inputs: unknown[]): string {
  // Stub: replace with your MUI-compatible className utility if needed.
  return _inputs.filter(Boolean).join(" ");
}
