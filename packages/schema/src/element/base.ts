import { z } from 'zod';
import { rectSchema } from '../geometry';
import { entityId } from '../id';
import { slotIdSchema } from '../layout';

/**
 * Schema for an element identifier, and a generator for new element identifiers.
 */
export const { schema: elementIdSchema, generate: elementId } = entityId<'ElementId'>('el');

/**
 * An element identifier.
 */
export type ElementId = z.infer<typeof elementIdSchema>;

/**
 * Schema for the fields shared by every element.
 * An element either binds to a layout slot (slot) and inherits its geometry, or
 * is freely positioned (bounds). Enforcing exactly one of them is deferred to
 * the engine's deck resolution.
 */
export const baseElementSchema = z.object({
  id: elementIdSchema,
  slot: slotIdSchema.optional(),
  bounds: rectSchema.optional(),
});

/**
 * The fields shared by every element.
 */
export type BaseElement = Readonly<z.infer<typeof baseElementSchema>>;
