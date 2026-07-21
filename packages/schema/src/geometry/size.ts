import { z } from 'zod';
import { Emu, positiveEmuSchema } from '../units';

/**
 * Schema for a 2D size in EMU.
 */
export const sizeSchema = z
  .object({
    /**
     * The width in EMU.
     */
    w: positiveEmuSchema,
    /**
     * The height in EMU.
     */
    h: positiveEmuSchema,
  })
  .readonly();

/**
 * A 2D size measured in EMU.
 */
export type Size = z.infer<typeof sizeSchema>;

/**
 * Creates a {@link Size} from already-branded dimensions.
 * Guards positivity via {@link positiveEmu} so hot paths avoid a Zod parse
 * per call; untrusted wire input is validated by {@link sizeSchema} instead.
 *
 * @param w - The width in EMU.
 * @param h - The height in EMU.
 * @returns The size.
 * @throws {RangeError} If width or height is not positive.
 */
export function size(w: Emu, h: Emu): Size {
  return { w: Emu.ofPositive(w), h: Emu.ofPositive(h) };
}
