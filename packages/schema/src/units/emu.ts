import { z } from 'zod';

/**
 * Schema for a length measured in EMU.
 */
export const emuSchema = z.int('EMU must be an integer').brand<'EMU'>();

/**
 * Schema for a positive length measured in EMU.
 * Used for measurements such as width and height.
 */
export const positiveEmuSchema = emuSchema.positive('EMU must be positive');

/**
 * A length in EMU.
 * EMU (English Metric Unit) is the canonical internal length unit for Auto Deck.
 * Branded to prevent mixing with raw numbers or other units.
 *
 * @see https://en.wikipedia.org/wiki/Office_Open_XML_file_formats
 */
export type Emu = z.infer<typeof emuSchema>;

/**
 * EMU per inch. 1 inch = 914,400 EMU.
 */
export const EMU_PER_INCH = 914_400;

/**
 * EMU per typographic point. 1 pt = 1/72 inch = 12,700 EMU.
 */
export const EMU_PER_POINT = 12_700;

/**
 * EMU per CSS pixel at 96 DPI. 1 px = 9,525 EMU.
 */
export const EMU_PER_PIXEL = 9_525;

/**
 * Brands an integer as an {@link Emu}.
 * Guards with a plain integer check so hot paths avoid a Zod parse per call;
 * untrusted wire input is validated by {@link emuSchema} instead.
 *
 * @param value - The length in EMU.
 * @returns The value branded as {@link Emu}.
 * @throws {RangeError} If the value is not an integer.
 */
export function emu(value: number): Emu {
  if (!Number.isInteger(value)) {
    throw new RangeError(`EMU must be an integer, but got ${value}.`);
  }
  return value as Emu;
}

/**
 * Brands a positive integer as an {@link Emu}.
 * The single home of the positivity rule shared by measurement factories such
 * as size and rect; untrusted wire input is validated by
 * {@link positiveEmuSchema} instead.
 *
 * @param value - The length in EMU.
 * @returns The value branded as {@link Emu}.
 * @throws {RangeError} If the value is not a positive integer.
 */
export function positiveEmu(value: number): Emu {
  const branded = emu(value);
  if (branded <= 0) {
    throw new RangeError(`EMU must be positive, but got ${value}.`);
  }
  return branded;
}

/**
 * Converts a value in the given unit to EMU, rounded to the nearest integer.
 *
 * @param value - The length in the source unit.
 * @param emuPerUnit - The number of EMU per one source unit.
 * @returns The converted length branded as {@link Emu}.
 */
function fromUnit(value: number, emuPerUnit: number): Emu {
  return emu(Math.round(value * emuPerUnit));
}

/**
 * Converts inches to {@link Emu}.
 *
 * @param value - The length in inches.
 * @returns The converted length in EMU.
 */
export function inches(value: number): Emu {
  return fromUnit(value, EMU_PER_INCH);
}

/**
 * Converts typographic points to {@link Emu}.
 *
 * @param value - The length in points.
 * @returns The converted length in EMU.
 */
export function points(value: number): Emu {
  return fromUnit(value, EMU_PER_POINT);
}

/**
 * Converts CSS pixels (96 DPI) to {@link Emu}.
 *
 * @param value - The length in pixels.
 * @returns The converted length in EMU.
 */
export function pixels(value: number): Emu {
  return fromUnit(value, EMU_PER_PIXEL);
}

/**
 * Converts {@link Emu} to inches.
 *
 * @param value - The length in EMU.
 * @returns The length in inches.
 */
export function toInches(value: Emu): number {
  return value / EMU_PER_INCH;
}

/**
 * Converts {@link Emu} to typographic points.
 *
 * @param value - The length in EMU.
 * @returns The length in points.
 */
export function toPoints(value: Emu): number {
  return value / EMU_PER_POINT;
}

/**
 * Converts {@link Emu} to CSS pixels (96 DPI).
 *
 * @param value - The length in EMU.
 * @returns The length in pixels.
 */
export function toPixels(value: Emu): number {
  return value / EMU_PER_PIXEL;
}
