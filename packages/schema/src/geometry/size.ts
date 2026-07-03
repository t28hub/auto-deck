import { z } from 'zod';
import { type Emu, positiveEmuSchema } from '../units';

/**
 * Schema for a 2D size in EMU.
 */
export const sizeSchema = z
  .object({
    /**
     * The width in EMU.
     */
    w: positiveEmuSchema,
    /**
     * The height in EMU.
     */
    h: positiveEmuSchema,
  })
  .readonly();

/**
 * A 2D size measured in EMU.
 */
export type Size = z.infer<typeof sizeSchema>;

/**
 * Creates a validated {@link Size}.
 *
 * @param w - The width in EMU.
 * @param h - The height in EMU.
 * @returns The validated size.
 * @throws {z.ZodError} If width or height is not a positive integer.
 */
export function size(w: Emu, h: Emu): Size {
  return sizeSchema.parse({ w, h });
}
