import { describe, expect, it } from 'vitest';
import { layoutIdSchema, layoutSchema } from './layout';

/**
 * Creates a valid fixture layout in wire format.
 */
function createLayout() {
  return {
    id: 'layout-title-content',
    name: 'Title and Content',
    slots: [
      {
        id: 'slot-title',
        styleToken: 'title',
        rect: { x: { ratio: 0 }, y: { ratio: 0 }, w: { ratio: 1 }, h: { ratio: 0.2 } },
      },
    ],
  };
}

describe('layoutIdSchema', () => {
  it.each(['layout-title-content', 'layout-1'])('should accept %s, which matches the layout id grammar', (id) => {
    // Act
    const actual = layoutIdSchema.safeParse(id);

    // Assert
    expect(actual.success).toBe(true);
  });

  it.each([
    'title-content',
    'slot-title',
    'el_000000000001',
  ])('should reject %j, which does not match the layout id grammar', (id) => {
    // Act
    const actual = layoutIdSchema.safeParse(id);

    // Assert
    expect(actual.success).toBe(false);
  });
});

describe('layoutSchema', () => {
  it('should parse a valid wire-format layout', () => {
    // Arrange
    const value = createLayout();

    // Act
    const actual = layoutSchema.safeParse(value);

    // Assert
    expect(actual.success).toBe(true);
  });

  it('should accept a layout with no slots', () => {
    // Arrange
    const value = { ...createLayout(), slots: [] };

    // Act
    const actual = layoutSchema.safeParse(value);

    // Assert
    expect(actual.success).toBe(true);
  });

  it('should reject a layout id without the layout- prefix', () => {
    // Arrange
    const value = { ...createLayout(), id: 'title-content' };

    // Act
    const actual = layoutSchema.safeParse(value);

    // Assert
    expect(actual.success).toBe(false);
  });

  it('should reject an empty layout name', () => {
    // Arrange
    const value = { ...createLayout(), name: '' };

    // Act
    const actual = layoutSchema.safeParse(value);

    // Assert
    expect(actual.success).toBe(false);
  });
});
