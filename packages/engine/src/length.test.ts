import { fixed, pixels, relative } from '@auto-deck/schema';
import { describe, expect, it } from 'vitest';
import { resolveLength } from './length';

describe('resolveLength', () => {
  it('should resolve a ratio against the extent', () => {
    // Act
    const actual = resolveLength(relative(0.5), pixels(1280));

    // Assert
    expect(actual).toBe(pixels(640));
  });

  it('should return a fixed length unchanged, ignoring the extent', () => {
    // Act
    const actual = resolveLength(fixed(pixels(100)), pixels(1280));

    // Assert
    expect(actual).toBe(pixels(100));
  });

  it('should add a fixed offset to a ratio', () => {
    // Act
    const actual = resolveLength(relative(0.25, pixels(10)), pixels(1280));

    // Assert
    expect(actual).toBe(pixels(330));
  });

  it('should round a fractional result to integer EMU', () => {
    // Act
    const actual = resolveLength(relative(1 / 3), pixels(1));

    // Assert
    expect(actual).toBe(3175);
  });
});
