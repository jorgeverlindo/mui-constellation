// ─── Jellybean helpers — browser-safe stubs ───────────────────────────────────
// The catalog-dependent functions (jbListColors, jbResolve) are stubs in the
// browser; the real implementations live in the server-side agent. The algo
// helpers (jbNorm, jbModelMatch, jbTrimScore) are re-exported from jellybean-algo.ts.

import { jbNorm, jbModelMatch, jbTrimScore } from "./jellybean-algo";
export { jbNorm, jbModelMatch, jbTrimScore };

/** Returns all available color families for a model — browser stub returns []. */
export function jbListColors(_model: string, _year?: string): string[] {
  return [];
}

/** Resolves the best jellybean URL — browser stub returns null (falls back to catalog image). */
export function jbResolve(
  _model: string,
  _colorFamily: string,
  _year?: string,
  _trim?: string,
): { url: string; id: string } | null {
  return null;
}
