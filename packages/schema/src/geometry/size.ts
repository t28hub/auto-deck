import { z } from 'zod';
import { positiveEmuSchema, type Emu } from '../units';

/**
 * Schema for a 2D size in EMU.
 */
export const sizeSchema = z
  .object({
    width: positiveEmuSchema,
    height: positiveEmuSchema,
  })
  .readonly();

/**
 * A 2D size measured in EMU.
 */
export type Size = z.infer<typeof sizeSchema>;

/**
 * Creates a validated {@link Size}.
 *
 * @param width - The width in EMU.
 * @param height - The height in EMU.
 * @returns The validated size.
 * @throws {z.ZodError} If width or height is not a positive integer.
 */
export function size(width: Emu, height: Emu): Size {
  return sizeSchema.parse({ width, height });
}