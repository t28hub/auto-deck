import { describe, expect, it } from 'vitest';
import { entityId, semanticIdSchema } from './id';

const testId = entityId<'TestId'>('test');

const testNameIdSchema = semanticIdSchema<'TestNameId'>(/^name-[a-z0-9-]+$/);

describe('entityId', () => {
  it('should generate an identifier its own schema accepts', () => {
    // Act
    const actual = testId.generate();

    // Assert
    const parsed = testId.schema.safeParse(actual);
    expect(parsed.success).toBe(true);
    expect(parsed.data).toMatch(/^test_[0-9a-z]{12}$/);
  });

  it.each([
    '',
    'el_000000000001',
    'test_abc123',
    'test_ABCDEF123456',
  ])('should reject %j, which does not match the identifier format', (id) => {
    // Act
    const actual = testId.schema.safeParse(id);

    // Assert
    expect(actual.success).toBe(false);
  });

  it.each(['', 'Deck', 'de.ck'])('should throw for the invalid prefix %j', (prefix) => {
    // Act & Assert
    expect(() => entityId<'TestId'>(prefix)).toThrow();
  });
});

describe('semanticIdSchema', () => {
  it.each(['name-title', 'name-body-2'])('should accept %s, which matches the supplied grammar', (name) => {
    // Act
    const actual = testNameIdSchema.safeParse(name);

    // Assert
    expect(actual.success).toBe(true);
    expect(actual.data).toMatch(/^name-[a-z0-9-]+$/);
  });

  it.each([
    '',
    'title',
    'name-',
    'Name-Title',
    'name_title',
    `name-${'a'.repeat(60)}`,
  ])('should reject %j, which does not match the supplied grammar', (name) => {
    // Act
    const actual = testNameIdSchema.safeParse(name);

    // Assert
    expect(actual.success).toBe(false);
  });
});
