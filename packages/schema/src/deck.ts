import { z } from 'zod';
import { idSchema } from './id';
import { canvasSchema } from './canvas';
import { slideSchema } from './slide';

/**
 * Schema for a deck, a presentation of slides.
 */
export const deckSchema = z
  .object({
    id: idSchema,
    canvas: canvasSchema,
    slides: z.array(slideSchema).readonly(),
  })
  .readonly();

/**
 * A deck, a presentation of slides.
 */
export type Deck = z.infer<typeof deckSchema>;