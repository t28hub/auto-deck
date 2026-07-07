import { describe, expect, it } from 'vitest';
import { baseElementSchema, elementId } from './base';

/**
 * Creates a valid fixture element in wire format, bound to a slot.
 */
function createElement() {
  return {
    id: 'el_000000000001',
    slot: 'slot-title',
  };
}

describe('elementId', () => {
  it('should generate an identifier with the element prefix', () => {
    // Act
    const actual = elementId();

    // Assert
    expect(actual).toMatch(/^el_/);
  });
});

describe('baseElementSchema', () => {
  it('should parse a valid wire-format element bound to a slot', () => {
    // Arrange
    const value = createElement();

    // Act
    const actual = baseElementSchema.safeParse(value);

    // Assert
    expect(actual.success).toBe(true);
  });

  it('should accept a freely positioned element with bounds', () => {
    // Arrange
    const value = { id: 'el_000000000001', bounds: { x: 0, y: 0, w: 9525, h: 9525 } };

    // Act
    const actual = baseElementSchema.safeParse(value);

    // Assert
    expect(actual.success).toBe(true);
  });

  it('should accept both a slot and bounds because exclusivity is enforced at resolve time', () => {
    // Arrange
    const value = { ...createElement(), bounds: { x: 0, y: 0, w: 9525, h: 9525 } };

    // Act
    const actual = baseElementSchema.safeParse(value);

    // Assert
    expect(actual.success).toBe(true);
  });

  it('should reject an element id with a different entity prefix', () => {
    // Arrange
    const value = { ...createElement(), id: 'slide_000000000001' };

    // Act
    const actual = baseElementSchema.safeParse(value);

    // Assert
    expect(actual.success).toBe(false);
  });

  it('should reject a slot binding without the slot- prefix', () => {
    // Arrange
    const value = { ...createElement(), slot: 'title' };

    // Act
    const actual = baseElementSchema.safeParse(value);

    // Assert
    expect(actual.success).toBe(false);
  });
});
