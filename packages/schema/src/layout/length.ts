import { z } from 'zod';
import { type Emu, emuSchema } from '../units';

/**
 * Schema for a length within a layout spec.
 * Either a fixed length in EMU, or a relative length.
 */
export const lengthSchema = z.union([
  z.object({ emu: emuSchema }).readonly(),
  z.object({ ratio: z.number().nonnegative(), offset: emuSchema.optional() }).readonly(),
]);

/**
 * A length within a layout spec.
 * Either a fixed length in EMU, or a relative length.
 */
export type Length = z.infer<typeof lengthSchema>;

/**
 * Creates a fixed {@link Length}.
 *
 * @param value - The fixed length in EMU.
 * @returns The fixed length.
 */
export function fixed(value: Emu): Length {
  return lengthSchema.parse({ emu: value });
}

/**
 * Creates a relative {@link Length}.
 *
 * @param ratio - The ratio of the reference extent.
 * @param offset - An optional fixed offset in EMU added to the relative part.
 * @returns The relative length.
 */
export function relative(ratio: number, offset?: Emu): Length {
  if (offset === undefined) {
    return lengthSchema.parse({ ratio });
  }
  return lengthSchema.parse({ ratio, offset });
}
