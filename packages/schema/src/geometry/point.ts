import { z } from 'zod';
import { emuSchema, type Emu } from '../units';

/**
 * Schema for a 2D point in EMU.
 */
export const pointSchema = z
  .object({
      /**
       * The x coordinate in EMU.
       */
    x: emuSchema,
      /**
       * The y coordinate in EMU.
       */
    y: emuSchema,
  })
  .readonly();

/**
 * A 2D point measured in EMU.
 */
export type Point = z.infer<typeof pointSchema>;

/**
 * Creates a validated {@link Point}.
 *
 * @param x - The horizontal coordinate in EMU.
 * @param y - The vertical coordinate in EMU.
 * @returns The validated point.
 * @throws {z.ZodError} If a coordinate is not an integer.
 */
export function point(x: Emu, y: Emu): Point {
  return pointSchema.parse({ x, y });
}