import { describe, expect, it } from 'vitest';
import { clamp } from './math';

describe('clamp', () => {
  it('should return the value when it is inside the range', () => {
    // Exercise
    const actual = clamp(2, 1, 3);

    // Verify
    expect(actual).toBe(2);
  });

  it.each([
    { value: 1, expected: 1 },
    { value: 3, expected: 3 },
    { value: 0, expected: 1 },
    { value: 4, expected: 3 },
    { value: Number.POSITIVE_INFINITY, expected: 3 },
    { value: Number.NEGATIVE_INFINITY, expected: 1 },
  ])('should return $expected when clamping $value', ({ value, expected }) => {
    // Exercise
    const actual = clamp(value, 1, 3);

    // Verify
    expect(actual).toBe(expected);
  });

  it.each([0, 1, 2])('should collapse the value %d to the single point of a degenerate range', (value) => {
    // Exercise
    const actual = clamp(value, 1, 1);

    // Verify
    expect(actual).toBe(1);
  });

  it('should return NaN when the value is NaN', () => {
    // Exercise
    const actual = clamp(Number.NaN, 1, 3);

    // Verify
    expect(actual).toBeNaN();
  });

  it('should throw a RangeError when the minimum exceeds the maximum', () => {
    // Exercise & Verify
    expect(() => clamp(2, 3, 1)).toThrow(RangeError);
  });
});
