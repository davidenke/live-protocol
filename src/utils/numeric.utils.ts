/**
 * Returns the number if it is finite, otherwise the fallback number.
 */
export function finiteOr(n: number, or: number): number {
  return Number.isFinite(n) ? n : or;
}
