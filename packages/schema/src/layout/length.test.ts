import { describe, expect, it } from 'vitest';
import { emu } from '../units';
import { fixed, lengthSchema, relative } from './length';

describe('lengthSchema', () => {
  it.each([{ emu: 9525 }, { ratio: 0.5 }, { ratio: 0.5, offset: 9525 }])('should accept the length %j', (value) => {
    // Act
    const actual = lengthSchema.safeParse(value);

    // Assert
    expect(actual.success).toBe(true);
  });

  it.each([
    {},
    { emu: 12.5 },
    { ratio: -1 },
    { ratio: 0.5, offset: 12.5 },
  ])('should reject the malformed length %j', (value) => {
    // Act
    const actual = lengthSchema.safeParse(value);

    // Assert
    expect(actual.success).toBe(false);
  });
});

describe('fixed', () => {
  it('should create a fixed length', () => {
    // Act
    const actual = fixed(emu(9525));

    // Assert
    expect(actual).toEqual({ emu: 9525 });
  });
});

describe('relative', () => {
  it('should create a relative length', () => {
    // Act
    const actual = relative(0.5);

    // Assert
    expect(actual).toEqual({ ratio: 0.5 });
  });

  it('should create a relative length with a fixed offset', () => {
    // Act
    const actual = relative(0.5, emu(9525));

    // Assert
    expect(actual).toEqual({ ratio: 0.5, offset: 9525 });
  });
});
