import { z } from 'zod';
import { semanticIdSchema } from '../id';
import { slotSchema } from './slot';

/**
 * Schema for a layout identifier, unique within its deck.
 */
export const layoutIdSchema = semanticIdSchema<'LayoutId'>(/^layout-[a-z0-9][a-z0-9-]*$/);

/**
 * A layout identifier.
 */
export type LayoutId = z.infer<typeof layoutIdSchema>;

/**
 * Schema for a layout: a named slide archetype defined by a set of slots.
 * Layouts are shared at the deck level and referenced by slides via their id.
 */
export const layoutSchema = z
  .object({
    id: layoutIdSchema,
    name: z.string().min(1),
    slots: z.array(slotSchema).readonly(),
  })
  .readonly();

/**
 * A named slide archetype defined by a set of slots.
 */
export type Layout = z.infer<typeof layoutSchema>;
