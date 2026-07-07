import { describe, expect, it } from 'vitest';
import { emu } from '../units';
import { rect, rectSchema } from './rect';

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
