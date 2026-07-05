import { type Deck, deckSchema, pixels, WIDESCREEN_16_9 } from '@auto-deck/schema';
import { assert, describe, expect, it } from 'vitest';
import { resolveDeck } from './deck';

const TITLE_SLOT = {
  id: 'title',
  styleToken: 'title',
  rect: { x: { ratio: 0 }, y: { ratio: 0 }, w: { ratio: 1 }, h: { ratio: 0.2 } },
};

const LAYOUT = { id: 'layout-1', name: 'Layout', slots: [TITLE_SLOT] };

const SLIDE = {
  id: 'slide-1',
  layoutId: 'layout-1',
  elements: [{ id: 'el-1', type: 'text', slot: 'title', text: 'Hello' }],
};

/**
 * Builds a validated one-layout deck from wire-format slides.
 */
function makeDeck(slides: readonly unknown[], layouts: readonly unknown[] = [LAYOUT]): Deck {
  return deckSchema.parse({
    id: 'deck-1',
    canvas: {
      id: 'canvas-1',
      displayName: 'Widescreen 16:9',
      size: WIDESCREEN_16_9,
    },
    layouts,
    slides,
  });
}

describe('resolveDeck', () => {
  it('should resolve a deck into self-contained slides without layouts', () => {
    // Arrange
    const deck = makeDeck([SLIDE]);

    // Act
    const actual = resolveDeck(deck);

    // Assert
    assert(actual.success, 'Expected deck resolution to succeed');
    expect(actual.value.slides).toHaveLength(1);
    expect(actual.value).not.toHaveProperty('layouts');
    expect(actual.value.slides[0]?.elements[0]?.bounds).toEqual({
      x: pixels(0),
      y: pixels(0),
      w: pixels(1280),
      h: pixels(144),
    });
  });

  it('should shrink the content area by the margin', () => {
    // Arrange
    const deck = makeDeck([SLIDE]);

    // Act
    const actual = resolveDeck(deck, { margin: pixels(10) });

    // Assert
    assert(actual.success, 'Expected deck resolution to succeed');
    expect(actual.value.slides[0]?.elements[0]?.bounds).toEqual({
      x: pixels(10),
      y: pixels(10),
      w: pixels(1260),
      h: pixels(140),
    });
  });

  it('should report duplicate-layout-id', () => {
    // Arrange
    const deck = makeDeck([SLIDE], [LAYOUT, LAYOUT]);

    // Act
    const actual = resolveDeck(deck);

    // Assert
    assert(!actual.success, 'Expected deck resolution to fail due to a duplicate layout id');
    expect(actual.diagnostics).toContainEqual(
      expect.objectContaining({ code: 'duplicate-layout-id', layoutId: 'layout-1' }),
    );
  });

  it('should report duplicate-slide-id', () => {
    // Arrange
    const deck = makeDeck([SLIDE, SLIDE]);

    // Act
    const actual = resolveDeck(deck);

    // Assert
    assert(!actual.success, 'Expected deck resolution to fail due to a duplicate slide id');
    expect(actual.diagnostics).toContainEqual(
      expect.objectContaining({ code: 'duplicate-slide-id', slideId: 'slide-1' }),
    );
  });

  it('should report duplicate-element-id across slides', () => {
    // Arrange
    const deck = makeDeck([SLIDE, { ...SLIDE, id: 'slide-2' }]);

    // Act
    const actual = resolveDeck(deck);

    // Assert
    assert(!actual.success, 'Expected deck resolution to fail due to a duplicate element id');
    expect(actual.diagnostics).toContainEqual(
      expect.objectContaining({ code: 'duplicate-element-id', elementId: 'el-1' }),
    );
  });

  it('should report unknown-layout for a slide referencing a missing layout', () => {
    // Arrange
    const deck = makeDeck([{ ...SLIDE, layoutId: 'ghost' }]);

    // Act
    const actual = resolveDeck(deck);

    // Assert
    assert(!actual.success, 'Expected deck resolution to fail due to an unknown layout');
    expect(actual.diagnostics).toContainEqual(
      expect.objectContaining({ code: 'unknown-layout', slideId: 'slide-1', layoutId: 'ghost' }),
    );
  });

  it('should report invalid-content-area when the margin consumes the canvas', () => {
    // Arrange
    const deck = makeDeck([SLIDE]);

    // Act
    const actual = resolveDeck(deck, { margin: pixels(400) });

    // Assert
    assert(!actual.success, 'Expected deck resolution to fail due to an oversized margin');
    expect(actual.diagnostics).toContainEqual(expect.objectContaining({ code: 'invalid-content-area' }));
  });

  it('should propagate diagnostics from slide resolution', () => {
    // Arrange
    const slide = {
      id: 'slide-1',
      layoutId: 'layout-1',
      elements: [{ id: 'el-1', type: 'text', text: 'X' }],
    };
    const deck = makeDeck([slide]);

    // Act
    const actual = resolveDeck(deck);

    // Assert
    assert(!actual.success, 'Expected deck resolution to fail due to a slide-level diagnostic');
    expect(actual.diagnostics).toContainEqual(
      expect.objectContaining({ code: 'missing-geometry', elementId: 'el-1', slideId: 'slide-1' }),
    );
  });

  it('should collect every diagnostic instead of stopping at the first', () => {
    // Arrange
    const deck = makeDeck([SLIDE, SLIDE, { ...SLIDE, layoutId: 'ghost' }]);

    // Act
    const actual = resolveDeck(deck);

    // Assert
    assert(!actual.success, 'Expected deck resolution to fail with multiple diagnostics');
    const codes = actual.diagnostics.map((diagnostic) => diagnostic.code);
    expect(codes).toContain('duplicate-slide-id');
    expect(codes).toContain('unknown-layout');
  });
});
