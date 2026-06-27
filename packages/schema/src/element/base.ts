import { z } from 'zod';
import { idSchema } from '../id';
import { rectSchema } from '../geometry';

/**
 * Schema for the fields shared by every element.
 */
export const baseElementSchema = z.object({
  id: idSchema,
  bounds: rectSchema,
});

/**
 * The fields shared by every element.
 */
export type BaseElement = Readonly<z.infer<typeof baseElementSchema>>;