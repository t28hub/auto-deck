import { z } from 'zod';
import { brandedIdSchema } from '../id';
import { lengthSchema } from './length';

/**
 * Schema for a slot identifier, unique within its layout.
 */
export const slotIdSchema = brandedIdSchema<'SlotId'>();

/**
 * A slot identifier, unique within its layout.
 */
export type SlotId = z.infer<typeof slotIdSchema>;

/**
 * Schema for a rectangle expressed in relative lengths.
 */
export const lengthRectSchema = z
  .object({
    x: lengthSchema,
    y: lengthSchema,
    w: lengthSchema,
    h: lengthSchema,
  })
  .readonly();

/**
 * A rectangle expressed in relative lengths, relative to the content area.
 */
export type LengthRect = z.infer<typeof lengthRectSchema>;

/**
 * Schema for how a slot distributes repeating content.
 */
export const flowSchema = z
  .object({
    gap: lengthSchema,
    max: z.number().int().positive().optional(),
  })
  .readonly();

/**
 * How a slot distributes repeating content.
 */
export type Flow = z.infer<typeof flowSchema>;

/**
 * Schema for a positioned region of a layout that elements bind to.
 */
export const slotSchema = z
  .object({
    id: slotIdSchema,
    rect: lengthRectSchema,
    styleToken: z.string().min(1),
    flow: flowSchema.optional(),
  })
  .readonly();

/**
 * A positioned region of a layout that elements bind to.
 */
export type Slot = z.infer<typeof slotSchema>;
