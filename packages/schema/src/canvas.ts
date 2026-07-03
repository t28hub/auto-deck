import { z } from 'zod';
import { type Size, size, sizeSchema } from './geometry';
import { idSchema } from './id';
import { pixels } from './units';

/**
 * 16:9 widescreen canvas size (1280×720 px @96dpi), the common PowerPoint widescreen size.
 *
 * @see https://aspectratiocalculator.com/presentation-aspect-ratios/
 */
export const WIDESCREEN_16_9: Size = size(pixels(1280), pixels(720));

/**
 * 4:3 standard canvas size (960×720 px @96dpi), the common PowerPoint standard size.
 *
 * @see https://aspectratiocalculator.com/presentation-aspect-ratios/
 */
export const STANDARD_4_3: Size = size(pixels(960), pixels(720));

/**
 * Canvas sizes keyed by preset name.
 */
export const CANVAS_PRESETS = {
  widescreen: WIDESCREEN_16_9,
  standard: STANDARD_4_3,
} as const;

/**
 * Schema for the name of a canvas preset.
 */
export const canvasPresetSchema = z.enum(Object.keys(CANVAS_PRESETS) as [keyof typeof CANVAS_PRESETS]);

/**
 * The name of a canvas preset.
 */
export type CanvasPreset = z.infer<typeof canvasPresetSchema>;

/**
 * Resolves a canvas preset name to its {@link Size}.
 *
 * @param preset - The preset name.
 * @returns The canvas size for the preset.
 */
export function canvasSizeOf(preset: CanvasPreset): Size {
  return CANVAS_PRESETS[preset];
}

/**
 * Schema for a canvas, the shared page setup of a deck.
 */
export const canvasSchema = z
  .object({
    id: idSchema,
    displayName: z.string().min(1),
    size: sizeSchema,
  })
  .readonly();

/**
 * A canvas, the shared page setup of a deck.
 */
export type Canvas = z.infer<typeof canvasSchema>;
