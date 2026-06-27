import { z } from 'zod';
import { pointSchema, type Point } from './point';
import { sizeSchema, type Size } from './size';

/**
 * Schema for an axis-aligned rectangle in EMU.
 */
export const rectSchema = z
  .object({
    position: pointSchema,
    size: sizeSchema,
  })
  .readonly();

/**
 * An axis-aligned rectangle measured in EMU.
 */
export type Rect = z.infer<typeof rectSchema>;

/**
 * Creates a validated {@link Rect}.
 *
 * @param position - The top-left position in EMU.
 * @param size - The size in EMU.
 * @returns The validated rectangle.
 * @throws {z.ZodError} If the position or size is invalid.
 */
export function rect(position: Point, size: Size): Rect {
  return rectSchema.parse({ position, size });
}