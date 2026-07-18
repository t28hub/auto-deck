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
 * A layout slot (slot) provides an element's base geometry, and authored
 * bounds (bounds) override it while the slot binding stays for a later reset.
 * A freely positioned element carries bounds alone. Requiring at least one of
 * them is deferred to the engine's deck resolution.
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
