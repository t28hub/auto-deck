import { customAlphabet } from 'nanoid';
import { z } from 'zod';

/**
 * The alphabet of characters used in the random part of an entity identifier.
 */
const ID_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';

/**
 * The length of the random part of an entity identifier.
 */
const ID_RANDOM_LENGTH = 12;

const randomIdPart = customAlphabet(ID_ALPHABET, ID_RANDOM_LENGTH);

/**
 * Creates a branded identifier schema that validates a string against a grammar
 * and a maximum length of 64 characters.
 *
 * @param pattern - The regular expression pattern that the identifier must match.
 * @returns The branded identifier schema.
 */
export function semanticIdSchema<Brand extends string>(pattern: RegExp) {
  return z.string().regex(pattern).max(64).brand<Brand>();
}

/**
 * Creates a branded identifier schema and a generator for new identifiers with a given prefix.
 *
 * @param prefix - The entity type prefix (e.g. `slide`).
 * @returns An object containing the branded identifier schema and a generator function for new identifiers.
 * @throws {Error} If the prefix is not a lowercase alphabetic string.
 */
export function entityId<Brand extends string>(prefix: string) {
  if (!/^[a-z]+$/.test(prefix)) {
    throw new Error(`Entity id prefix must be lowercase alphabetic, but got "${prefix}".`);
  }

  const schema = z
    .string()
    .regex(new RegExp(`^${prefix}_[${ID_ALPHABET}]{${ID_RANDOM_LENGTH}}$`))
    .brand<Brand>();
  type Id = z.infer<typeof schema>;

  /**
   * Generates a new identifier with this entity's prefix.
   *
   * @returns The generated identifier.
   */
  function generate(): Id {
    // The parse guards the generator against drifting from the schema; the
    // cast only collapses the conditional type Zod infers while the Brand
    // type parameter is unresolved.
    return schema.parse(`${prefix}_${randomIdPart()}`) as Id;
  }

  return { schema, generate } as const;
}
