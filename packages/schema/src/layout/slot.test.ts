import { describe, expect, it } from 'vitest';
import { slotIdSchema, slotSchema } from './slot';

/**
 * Creates a valid fixture slot in wire format.
 */
function createSlot() {
  return {
    id: 'slot-title',
    styleToken: 'title',
    rect: { x: { ratio: 0 }, y: { ratio: 0 }, w: { ratio: 1 }, h: { ratio: 0.2 } },
  };
}

describe('slotIdSchema', () => {
  it.each(['slot-title', 'slot-body-2'])('should accept %s, which matches the slot id grammar', (id) => {
    // Act
    const actual = slotIdSchema.safeParse(id);

    // Assert
    expect(actual.success).toBe(true);
  });

  it.each([
    'title',
    'layout-title',
    'el_000000000001',
  ])('should reject %j, which does not match the slot id grammar', (id) => {
    // Act
    const actual = slotIdSchema.safeParse(id);

    // Assert
    expect(actual.success).toBe(false);
  });
});

describe('slotSchema', () => {
  it('should parse a valid wire-format slot', () => {
    // Arrange
    const value = createSlot();

    // Act
    const actual = slotSchema.safeParse(value);

    // Assert
    expect(actual.success).toBe(true);
  });

  it('should accept a slot with a flow', () => {
    // Arrange
    const value = { ...createSlot(), flow: { gap: { ratio: 0.02 }, max: 3 } };

    // Act
    const actual = slotSchema.safeParse(value);

    // Assert
    expect(actual.success).toBe(true);
  });

  it('should reject a slot id without the slot- prefix', () => {
    // Arrange
    const value = { ...createSlot(), id: 'title' };

    // Act
    const actual = slotSchema.safeParse(value);

    // Assert
    expect(actual.success).toBe(false);
  });

  it('should reject an empty style token', () => {
    // Arrange
    const value = { ...createSlot(), styleToken: '' };

    // Act
    const actual = slotSchema.safeParse(value);

    // Assert
    expect(actual.success).toBe(false);
  });

  it('should reject a non-positive flow max', () => {
    // Arrange
    const value = { ...createSlot(), flow: { gap: { ratio: 0.02 }, max: 0 } };

    // Act
    const actual = slotSchema.safeParse(value);

    // Assert
    expect(actual.success).toBe(false);
  });
});
