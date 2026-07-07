import { describe, expect, it } from 'vitest';
import { elementSchema } from './element';

/**
 * Creates a valid fixture text element in wire format.
 */
function createTextElement() {
  return {
    id: 'el_000000000001',
    type: 'text',
    slot: 'slot-title',
    text: 'Hello',
  };
}

describe('elementSchema', () => {
  it('should parse a valid wire-format text element', () => {
    // Arrange
    const value = createTextElement();

    // Act
    const actual = elementSchema.safeParse(value);

    // Assert
    expect(actual.success).toBe(true);
  });

  it('should reject an unknown element type', () => {
    // Arrange
    const value = { ...createTextElement(), type: 'video' };

    // Act
    const actual = elementSchema.safeParse(value);

    // Assert
    expect(actual.success).toBe(false);
  });
});
