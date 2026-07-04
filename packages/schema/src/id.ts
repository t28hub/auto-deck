import { z } from 'zod';

/**
 * Builds a non-empty string schema branded with the given tag, so every entity
 * identifier shares one validation policy.
 *
 * @returns The branded identifier schema.
 */
export function brandedIdSchema<Brand extends string>() {
  return z.string().min(1).brand<Brand>();
}

/**
 * Schema for a unique entity identifier.
 */
export const idSchema = brandedIdSchema<'Id'>();

/**
 * A unique entity identifier.
 */
export type Id = z.infer<typeof idSchema>;

/**
 * Validates a string and brands it as an {@link Id}.
 *
 * @param value - The identifier string.
 * @returns The validated identifier.
 * @throws {z.ZodError} If the value is empty.
 */
export function id(value: string): Id {
  return idSchema.parse(value);
}
