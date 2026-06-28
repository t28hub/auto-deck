import { z } from 'zod';
import { idSchema } from './id';
import { layoutIdSchema } from './layout';
import { elementSchema } from './element';

/**
 * Schema for a slide, a single page of a deck.
 * A slide picks a layout and holds its elements. Each element either binds to a
 * slot of that layout (the engine computes its geometry) or is freely positioned
 * with its own bounds.
 */
export const slideSchema = z
  .object({
    id: idSchema,
    layoutId: layoutIdSchema,
    elements: z.array(elementSchema).readonly(),
  })
  .readonly();

/**
 * A slide, a single page of a deck.
 */
export type Slide = z.infer<typeof slideSchema>;
