import { Emu, fixed, relative } from '@auto-deck/schema';
import { describe, expect, it } from 'vitest';
import { resolveLength } from './length';

describe('resolveLength', () => {
  it('should resolve a ratio against the extent', () => {
    // Act
    const actual = resolveLength(relative(0.5), Emu.fromPixels(1280));

    // Assert
    expect(actual).toBe(Emu.fromPixels(640));
  });

  it('should return a fixed length unchanged, ignoring the extent', () => {
    // Act
    const actual = resolveLength(fixed(Emu.fromPixels(100)), Emu.fromPixels(1280));

    // Assert
    expect(actual).toBe(Emu.fromPixels(100));
  });

  it('should add a fixed offset to a ratio', () => {
    // Act
    const actual = resolveLength(relative(0.25, Emu.fromPixels(10)), Emu.fromPixels(1280));

    // Assert
    expect(actual).toBe(Emu.fromPixels(330));
  });

  it('should round a fractional result to integer EMU', () => {
    // Act
    const actual = resolveLength(relative(1 / 3), Emu.fromPixels(1));

    // Assert
    expect(actual).toBe(3175);
  });
});
