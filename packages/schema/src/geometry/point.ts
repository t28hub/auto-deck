import { z } from 'zod';
import { type Emu, emuSchema } from '../units';

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
 * Creates a {@link Point} from already-branded coordinates.
 * The {@link Emu} brand carries the invariants, so no runtime validation is
 * needed; untrusted wire input is validated by {@link pointSchema} instead.
 *
 * @param x - The horizontal coordinate in EMU.
 * @param y - The vertical coordinate in EMU.
 * @returns The point.
 */
export function point(x: Emu, y: Emu): Point {
  return { x, y };
}
