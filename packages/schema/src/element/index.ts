import { z } from 'zod';
import { textElementSchema } from './text';

export * from './text';

/**
 * Schema for an element placed on a slide.
 */
export const elementSchema = z.discriminatedUnion('type', [textElementSchema]);

/**
 * An element placed on a slide.
 */
export type Element = z.infer<typeof elementSchema>;