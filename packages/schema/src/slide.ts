import { z } from 'zod';
import { idSchema } from './id';
import { elementSchema } from './element';

/**
 * Schema for a slide, a single page of a deck.
 */
export const slideSchema = z
  .object({
    id: idSchema,
    elements: z.array(elementSchema).readonly(),
  })
  .readonly();

/**
 * A slide, a single page of a deck.
 */
export type Slide = z.infer<typeof slideSchema>;
