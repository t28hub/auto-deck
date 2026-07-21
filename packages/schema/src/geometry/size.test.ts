import { describe, expect, it } from 'vitest';
import { Emu } from '../units';
import { size, sizeSchema } from './size';

describe('sizeSchema', () => {
  it('should parse a valid size', () => {
    // Act
    const actual = sizeSchema.safeParse({ w: 9525, h: 19_050 });

    // Assert
    expect(actual.success).toBe(true);
    expect(actual.data).toEqual({ w: 9525, h: 19_050 });
  });

  it.each([
    {},
    { w: 9525 },
    { w: 0, h: 19_050 },
    { w: 9525, h: -19_050 },
  ])('should reject the malformed size %j', (value) => {
    // Act
    const actual = sizeSchema.safeParse(value);

    // Assert
    expect(actual.success).toBe(false);
  });
});

describe('size', () => {
  it('should create a size from branded dimensions', () => {
    // Act
    const actual = size(Emu.of(9525), Emu.of(19_050));

    // Assert
    expect(actual).toEqual({ w: 9525, h: 19_050 });
  });

  it('should reject a non-positive dimension', () => {
    // Act & Assert
    expect(() => size(Emu.of(9525), Emu.of(0))).toThrow(RangeError);
  });
});
