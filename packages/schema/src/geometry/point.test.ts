import { describe, expect, it } from 'vitest';
import { Emu } from '../units';
import { point, pointSchema } from './point';

describe('pointSchema', () => {
  it('should parse a valid point', () => {
    // Act
    const actual = pointSchema.safeParse({ x: 9525, y: 19_050 });

    // Assert
    expect(actual.success).toBe(true);
    expect(actual.data).toEqual({ x: 9525, y: 19_050 });
  });

  it.each([{}, { x: 9525 }, { x: 9.5, y: 19_050 }])('should reject the malformed point %j', (value) => {
    // Act
    const actual = pointSchema.safeParse(value);

    // Assert
    expect(actual.success).toBe(false);
  });
});

describe('point', () => {
  it('should create a point from branded coordinates', () => {
    // Act
    const actual = point(Emu.of(9525), Emu.of(19_050));

    // Assert
    expect(actual).toEqual({ x: 9525, y: 19_050 });
  });
});
