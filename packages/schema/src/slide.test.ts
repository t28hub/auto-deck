import { describe, expect, it } from 'vitest';
import { slideId, slideSchema } from './slide';

/**
 * Mutable wire-format slide shape. The element array is a single-element tuple
 * so tests can index it without assertions.
 */
interface SlideSpec {
  id: string;
  layoutId: string;
  elements: [
    {
      id: string;
      type: string;
      slot: string;
      text: string;
    },
  ];
}

/**
 * Creates a valid fixture slide in wire format.
 */
function createSlide(): SlideSpec {
  return {
    id: 'slide_000000000001',
    layoutId: 'layout-title-content',
    elements: [{ id: 'el_000000000001', type: 'text', slot: 'slot-title', text: 'Hello' }],
  };
}

describe('slideId', () => {
  it('should generate an identifier with the slide prefix', () => {
    // Act
    const actual = slideId();

    // Assert
    expect(actual).toMatch(/^slide_/);
  });
});

describe('slideSchema', () => {
  it('should parse a valid wire-format slide', () => {
    // Arrange
    const slide = createSlide();

    // Act
    const actual = slideSchema.safeParse(slide);

    // Assert
    expect(actual.success).toBe(true);
  });

  it('should accept a slide with no elements', () => {
    // Arrange
    const slide = { ...createSlide(), elements: [] };

    // Act
    const actual = slideSchema.safeParse(slide);

    // Assert
    expect(actual.success).toBe(true);
  });

  it('should reject a slide id with a different entity prefix', () => {
    // Arrange
    const slide = { ...createSlide(), id: 'el_000000000001' };

    // Act
    const actual = slideSchema.safeParse(slide);

    // Assert
    expect(actual.success).toBe(false);
  });

  it('should reject a layout id without the layout- prefix', () => {
    // Arrange
    const slide = { ...createSlide(), layoutId: 'title-content' };

    // Act
    const actual = slideSchema.safeParse(slide);

    // Assert
    expect(actual.success).toBe(false);
  });
});
