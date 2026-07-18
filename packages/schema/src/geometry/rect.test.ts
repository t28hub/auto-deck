import { describe, expect, it } from 'vitest';
import { emu } from '../units';
import { rect, rectEquals, rectSchema } from './rect';

describe('rectSchema', () => {
  it('should parse a valid rectangle', () => {
    // Act
    const actual = rectSchema.safeParse({ x: 0, y: 9525, w: 9525, h: 19_050 });

    // Assert
    expect(actual.success).toBe(true);
    expect(actual.data).toEqual({ x: 0, y: 9525, w: 9525, h: 19_050 });
  });

  it.each([{}, { x: 0, y: 9525, w: 9525 }])('should reject the malformed rectangle %j', (value) => {
    // Act
    const actual = rectSchema.safeParse(value);

    // Assert
    expect(actual.success).toBe(false);
  });
});

describe('rect', () => {
  it('should create a rectangle from branded coordinates and dimensions', () => {
    // Act
    const actual = rect(emu(0), emu(9525), emu(9525), emu(19_050));

    // Assert
    expect(actual).toEqual({ x: 0, y: 9525, w: 9525, h: 19_050 });
  });

  it('should reject a non-positive dimension', () => {
    // Act & Assert
    expect(() => rect(emu(0), emu(0), emu(9525), emu(0))).toThrow(RangeError);
  });
});

describe('rectEquals', () => {
  it('should return true when comparing a rectangle to itself', () => {
    // Arrange
    const base = rect(emu(0), emu(9525), emu(9525), emu(19_050));

    // Act
    const actual = rectEquals(base, base);

    // Assert
    expect(actual).toBe(true);
  });

  it('should return true when comparing two identical rectangles', () => {
    // Arrange
    const rect1 = rect(emu(0), emu(9525), emu(9525), emu(19_050));
    const rect2 = rect(emu(0), emu(9525), emu(9525), emu(19_050));

    // Act
    const actual = rectEquals(rect1, rect2);

    // Assert
    expect(actual).toBe(true);
  });

  it.each([
    rect(emu(9525), emu(9525), emu(9525), emu(19_050)),
    rect(emu(0), emu(0), emu(9525), emu(19_050)),
    rect(emu(0), emu(9525), emu(19_050), emu(19_050)),
    rect(emu(0), emu(9525), emu(9525), emu(9525)),
  ])('should return false when comparing two different rectangles', (other) => {
    // Arrange
    const base = rect(emu(0), emu(9525), emu(9525), emu(19_050));

    // Act
    const actual = rectEquals(base, other);

    // Assert
    expect(actual).toBe(false);
  });
});
