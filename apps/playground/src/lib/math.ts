/**
 * Clamps a number between a minimum and maximum value.
 * `NaN` propagates so the caller decides how to treat it.
 *
 * @param value - The value to clamp.
 * @param min - The lower bound of the range.
 * @param max - The upper bound of the range.
 * @returns The value limited to the range from min to max.
 * @throws {RangeError} If min value exceeds max value.
 */
export function clamp(value: number, min: number, max: number): number {
  if (min > max) {
    throw new RangeError(`min (${min}) must not exceed max (${max})`);
  }
  return Math.min(Math.max(value, min), max);
}
