import { z } from 'zod';
import { type Size, size, sizeSchema } from './geometry';
import { entityId } from './id';
import { Emu } from './units';

/**
 * Schema for a canvas identifier, and a generator for new canvas identifiers.
 */
export const { schema: canvasIdSchema, generate: canvasId } = entityId<'CanvasId'>('canvas');

/**
 * A canvas identifier.
 */
export type CanvasId = z.infer<typeof canvasIdSchema>;

/**
 * 16:9 widescreen canvas size (1280×720 px @96dpi), the common PowerPoint widescreen size.
 *
 * @see https://aspectratiocalculator.com/presentation-aspect-ratios/
 */
export const WIDESCREEN_16_9: Size = size(Emu.fromPixels(1280), Emu.fromPixels(720));

/**
 * 4:3 standard canvas size (960×720 px @96dpi), the common PowerPoint standard size.
 *
 * @see https://aspectratiocalculator.com/presentation-aspect-ratios/
 */
export const STANDARD_4_3: Size = size(Emu.fromPixels(960), Emu.fromPixels(720));

/**
 * Schema for a canvas, the shared page setup of a deck.
 */
export const canvasSchema = z
  .object({
    id: canvasIdSchema,
    displayName: z.string().min(1),
    size: sizeSchema,
  })
  .readonly();

/**
 * A canvas, the shared page setup of a deck.
 */
export type Canvas = z.infer<typeof canvasSchema>;
