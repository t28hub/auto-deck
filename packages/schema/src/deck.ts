import { z } from 'zod';
import { canvasSchema } from './canvas';
import { entityId } from './id';
import { layoutSchema } from './layout';
import { slideSchema } from './slide';

/**
 * Schema for a deck identifier, and a generator for new deck identifiers.
 */
export const { schema: deckIdSchema, generate: deckId } = entityId<'DeckId'>('deck');

/**
 * A deck identifier.
 */
export type DeckId = z.infer<typeof deckIdSchema>;

/**
 * Schema for a deck, a presentation of slides.
 * Deck-level integrity (unique layout/slide ids, references) is checked by the
 * engine's deck resolution, not here.
 */
export const deckSchema = z
  .object({
    id: deckIdSchema,
    canvas: canvasSchema,
    layouts: z.array(layoutSchema).readonly(),
    slides: z.array(slideSchema).readonly(),
  })
  .readonly();

/**
 * A deck, a presentation of slides.
 */
export type Deck = z.infer<typeof deckSchema>;
