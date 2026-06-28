import { z } from 'zod';
import type { Emu } from '../units';
import { pointSchema } from './point';
import { sizeSchema } from './size';

/**
 * Schema for an axis-aligned rectangle in EMU.
 * Flattens a point (x, y) and a size (w, h) into a single object.
 */
export const rectSchema = pointSchema
  .unwrap()
  .extend(sizeSchema.unwrap().shape)
  .readonly();

/**
 * An axis-aligned rectangle measured in EMU.
 */
export type Rect = z.infer<typeof rectSchema>;

/**
 * Creates a validated {@link Rect}.
 *
 * @param x - The left edge in EMU.
 * @param y - The top edge in EMU.
 * @param w - The width in EMU.
 * @param h - The height in EMU.
 * @returns The validated rectangle.
 * @throws {z.ZodError} If a coordinate is not an integer or a dimension is not positive.
 */
export function rect(x: Emu, y: Emu, w: Emu, h: Emu): Rect {
  return rectSchema.parse({ x, y, w, h });
}
