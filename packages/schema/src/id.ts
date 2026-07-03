import { z } from 'zod';

/**
 * Schema for a unique entity identifier.
 */
export const idSchema = z.string().min(1).brand<'Id'>();

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
