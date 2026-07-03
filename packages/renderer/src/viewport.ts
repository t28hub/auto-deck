import {toPixels, type Size} from '@auto-deck/schema';

/**
 * The viewport is the display area for a slide, in pixels.
 * It is used to scale and position the slide's content.
 */
export interface Viewport {
    /**
     * The display width, in pixels.
     */
    readonly width: number;

    /**
     * The display height, in pixels.
     */
    readonly height: number;
}

/**
 * Builds the default viewport that displays a canvas at its intrinsic 1:1 size.
 * Exact conversion; any output-format rounding is each renderer's own policy.
 *
 * @param canvas - The canvas size in EMU.
 * @returns A viewport matching the canvas in pixels.
 */
export function canvasViewport(canvas: Size): Viewport {
    return {width: toPixels(canvas.w), height: toPixels(canvas.h)};
}
