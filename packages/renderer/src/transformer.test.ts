import type { ResolvedDeck, ResolvedElement } from '@auto-deck/engine';
import { idSchema, pixels, rect, WIDESCREEN_16_9 } from '@auto-deck/schema';
import { describe, expect, it } from 'vitest';
import { scenesFromDeck } from './transformer';

const BOUNDS = rect(pixels(0), pixels(0), pixels(1280), pixels(144));

/**
 * Creates a resolved deck literal with one text element per slide. Built by
 * hand so this test exercises only the adapter, not the engine's solver.
 */
function createResolvedDeck(): ResolvedDeck {
  return {
    id: idSchema.parse('deck-1'),
    canvas: {
      id: idSchema.parse('canvas-1'),
      displayName: 'Widescreen 16:9',
      size: WIDESCREEN_16_9,
    },
    slides: [
      {
        id: idSchema.parse('slide-1'),
        elements: [{ id: idSchema.parse('el-1'), type: 'text', text: 'Hello', bounds: BOUNDS }],
      },
      {
        id: idSchema.parse('slide-2'),
        elements: [{ id: idSchema.parse('el-2'), type: 'text', text: 'World', bounds: BOUNDS }],
      },
    ],
  };
}

describe('scenesFromDeck', () => {
  it('should map each slide to a scene with its canvas and text nodes, in deck order', () => {
    // Act
    const deck = createResolvedDeck();
    const actual = scenesFromDeck(deck);

    // Assert
    const expected = [
      { id: 'slide-1', elementId: 'el-1', text: 'Hello' },
      { id: 'slide-2', elementId: 'el-2', text: 'World' },
    ].map(({ id, elementId, text }) => ({
      id,
      canvas: WIDESCREEN_16_9,
      children: [{ kind: 'text', id: elementId, bounds: BOUNDS, text, children: [] }],
    }));
    expect(actual).toEqual(expected);
  });

  it('should throw for an element kind the transformer does not handle', () => {
    // Arrange
    const unknownElement = {
      id: idSchema.parse('el-x'),
      type: 'unknown',
      bounds: BOUNDS,
    } as unknown as ResolvedElement;
    const deck: ResolvedDeck = {
      ...createResolvedDeck(),
      slides: [{ id: idSchema.parse('slide-1'), elements: [unknownElement] }],
    };

    // Act & Assert
    expect(() => scenesFromDeck(deck)).toThrow('Unhandled element type: unknown');
  });
});
