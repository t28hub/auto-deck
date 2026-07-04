import { z } from 'zod';
import { brandedIdSchema } from '../id';
import { type Slot, slotSchema } from './slot';

/**
 * Schema for a layout identifier.
 * Branded so a slide can reference the layout it uses with type safety.
 */
export const layoutIdSchema = brandedIdSchema<'LayoutId'>();

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

/**
 * Creates a validated {@link Layout}.
 *
 * @param id - The layout id, unique within its deck.
 * @param name - The human-readable layout name.
 * @param slots - The slots that make up the layout.
 * @returns The validated layout.
 * @throws {z.ZodError} If a field is invalid.
 */
export function layout(id: LayoutId, name: string, slots: readonly Slot[]): Layout {
  return layoutSchema.parse({ id, name, slots });
}
