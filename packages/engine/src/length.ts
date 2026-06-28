import type { Emu, Length } from '@auto-deck/schema';
import { emu } from '@auto-deck/schema';

/**
 * Resolves a layout {@link Length} to an absolute length in EMU.
 * A fixed length is returned as-is; a relative length is a ratio of the reference
 * extent plus its optional fixed offset, rounded to the nearest EMU.
 *
 * @param length - The length to resolve.
 * @param extent - The reference extent the ratio applies to.
 * @returns The absolute length in EMU.
 */
export function resolveLength(length: Length, extent: Emu): Emu {
  if ('emu' in length) {
    return length.emu;
  }
  return emu(Math.round(length.ratio * extent + (length.offset ?? 0)));
}
