import { describe, expect, it } from 'vitest';
import { EMU_PER_INCH, EMU_PER_PIXEL, EMU_PER_POINT, emu, inches, pixels, points, toPixels } from './emu';

describe('emu', () => {
  it.each([{ value: 0 }, { value: 1 }, { value: 9525 }, { value: -9525 }])('should brand the integer $value as EMU', ({
    value,
  }) => {
    // Act
    const actual = emu(value);

    // Assert
    expect(actual).toBe(value);
  });

  it.each([
    { value: 1.5, description: 'a non-integer' },
    { value: Number.NaN, description: 'NaN' },
    { value: Number.POSITIVE_INFINITY, description: 'Infinity' },
  ])('should reject $description', ({ value }) => {
    // Act & Assert
    expect(() => emu(value)).toThrow();
  });
});

describe('pixels', () => {
  it.each([
    { value: 0, expected: 0 },
    { value: 1, expected: EMU_PER_PIXEL },
    { value: -1, expected: -EMU_PER_PIXEL },
    { value: 1280, expected: 12_192_000 },
    { value: 409.6, expected: 3_901_440 }, // 409.6 px divides evenly into integer EMU.
    { value: 0.1, expected: 953 }, // 0.1 px is 952.5 EMU and rounds up.
  ])('should convert $value px to $expected EMU', ({ value, expected }) => {
    // Act
    const actual = pixels(value);

    // Assert
    expect(actual).toBe(expected);
  });
});

describe('inches', () => {
  it.each([
    { value: 0, expected: 0 },
    { value: 1, expected: EMU_PER_INCH },
    { value: 2.5, expected: 2_286_000 },
    { value: 1 / 7, expected: 130_629 }, // 1/7 inch is 130,628.57... EMU and rounds up.
  ])('should convert $value inches to $expected EMU', ({ value, expected }) => {
    // Act
    const actual = inches(value);

    // Assert
    expect(actual).toBe(expected);
  });
});

describe('points', () => {
  it.each([
    { value: 0, expected: 0 },
    { value: 1, expected: EMU_PER_POINT },
    { value: 0.5, expected: 6350 },
    { value: 1 / 3, expected: 4233 }, // 1/3 pt is 4,233.33... EMU and rounds down.
  ])('should convert $value points to $expected EMU', ({ value, expected }) => {
    // Act
    const actual = points(value);

    // Assert
    expect(actual).toBe(expected);
  });
});

describe('toPixels', () => {
  it.each([{ px: 0 }, { px: 1 }, { px: 720 }, { px: -720 }])('should round-trip $px pixels through EMU', ({ px }) => {
    // Act
    const actual = toPixels(pixels(px));

    // Assert
    expect(actual).toBe(px);
  });
});
