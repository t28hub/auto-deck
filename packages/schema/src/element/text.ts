import { z } from 'zod';
import { baseElementSchema } from './base';

/**
 * Schema for a text element.
 */
export const textElementSchema = baseElementSchema
  .extend({
    type: z.literal('text'),
    text: z.string(),
  })
  .readonly();

/**
 * A text element.
 */
export type TextElement = z.infer<typeof textElementSchema>;
