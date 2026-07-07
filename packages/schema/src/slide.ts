import { z } from 'zod';
import { elementSchema } from './element';
import { entityId } from './id';
import { layoutIdSchema } from './layout';

/**
 * Schema for a slide identifier, and a generator for new slide identifiers.
 */
export const { schema: slideIdSchema, generate: slideId } = entityId<'SlideId'>('slide');

/**
 * A slide identifier.
 */
export type SlideId = z.infer<typeof slideIdSchema>;

/**
 * Schema for a slide, a single page of a deck.
 * A slide picks a layout and holds its elements. Each element either binds to a
 * slot of that layout (the engine computes its geometry) or is freely positioned
 * with its own bounds.
 */
export const slideSchema = z
  .object({
    id: slideIdSchema,
    layoutId: layoutIdSchema,
    elements: z.array(elementSchema).readonly(),
  })
  .readonly();

/**
 * A slide, a single page of a deck.
 */
export type Slide = z.infer<typeof slideSchema>;
