import { Emu } from '@auto-deck/schema';
import { describe, expect, it } from 'vitest';
import { px } from './units';

describe('px', () => {
  it('should convert EMU to pixels exactly for pixel-aligned values', () => {
    // Act
    const actual = px(Emu.fromPixels(1280));

    // Assert
    expect(actual).toBe(1280);
  });

  it('should preserve two-decimal pixel values', () => {
    // Act
    const actual = px(Emu.fromPixels(201.6));

    // Assert
    expect(actual).toBe(201.6);
  });

  it('should round to two decimals', () => {
    // Act
    const actual = px(Emu.of(4763));

    // Assert
    expect(actual).toBe(0.5);
  });
});
