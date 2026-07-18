import type { z } from 'zod';
import { type Emu, positiveEmu } from '../units';
import { pointSchema } from './point';
import { sizeSchema } from './size';

/**
 * Schema for an axis-aligned rectangle in EMU.
 * Flattens a point (x, y) and a size (w, h) into a single object.
 */
export const rectSchema = pointSchema.unwrap().extend(sizeSchema.unwrap().shape).readonly();

/**
 * An axis-aligned rectangle measured in EMU.
 */
export type Rect = z.infer<typeof rectSchema>;

/**
 * Creates a {@link Rect} from already-branded coordinates and dimensions.
 * Guards positivity via {@link positiveEmu} so hot paths avoid a Zod parse
 * per call; untrusted wire input is validated by {@link rectSchema} instead.
 *
 * @param x - The left edge in EMU.
 * @param y - The top edge in EMU.
 * @param w - The width in EMU.
 * @param h - The height in EMU.
 * @returns The rectangle.
 * @throws {RangeError} If width or height is not positive.
 */
export function rect(x: Emu, y: Emu, w: Emu, h: Emu): Rect {
  return { x, y, w: positiveEmu(w), h: positiveEmu(h) };
}

/**
 * Compares two rectangles component-wise.
 *
 * @param a - The rectangle to compare.
 * @param b - The rectangle to compare against.
 * @returns Whether both rectangles hold the same values.
 */
export function rectEquals(a: Rect, b: Rect): boolean {
  return a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;
}
