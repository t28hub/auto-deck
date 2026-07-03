import { toPixels, type Emu } from '@auto-deck/schema';

/**
 * Converts EMU to pixels, rounded to two decimals.
 *
 * @param value - The length in EMU.
 * @returns The length in pixels.
 */
export function px(value: Emu): number {
  return Math.round(toPixels(value) * 100) / 100;
}
