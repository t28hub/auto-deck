import type { ResolvedDeck, ResolvedElement } from '@auto-deck/engine';
import {
  canvasIdSchema,
  deckIdSchema,
  elementIdSchema,
  pixels,
  rect,
  slideIdSchema,
  WIDESCREEN_16_9,
} from '@auto-deck/schema';
import { describe, expect, it } from 'vitest';
import { scenesFromDeck } from './transformer';

const BOUNDS = rect(pixels(0), pixels(0), pixels(1280), pixels(144));

/**
 * Creates a resolved deck literal with one text element per slide. Built by
 * hand so this test exercises only the adapter, not the engine's solver.
 */
function createResolvedDeck(): ResolvedDeck {
  return {
    id: deckIdSchema.parse('deck_000000000001'),
    canvas: {
      id: canvasIdSchema.parse('canvas_000000000001'),
      displayName: 'Widescreen 16:9',
      size: WIDESCREEN_16_9,
    },
    slides: [
      {
        id: slideIdSchema.parse('slide_000000000001'),
        elements: [{ id: elementIdSchema.parse('el_000000000001'), type: 'text', text: 'Hello', bounds: BOUNDS }],
      },
      {
        id: slideIdSchema.parse('slide_000000000002'),
        elements: [{ id: elementIdSchema.parse('el_000000000002'), type: 'text', text: 'World', bounds: BOUNDS }],
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
      { id: 'slide_000000000001', elementId: 'el_000000000001', text: 'Hello' },
      { id: 'slide_000000000002', elementId: 'el_000000000002', text: 'World' },
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
      id: elementIdSchema.parse('el_00000000000x'),
      type: 'unknown',
      bounds: BOUNDS,
    } as unknown as ResolvedElement;
    const deck: ResolvedDeck = {
      ...createResolvedDeck(),
      slides: [{ id: slideIdSchema.parse('slide_000000000001'), elements: [unknownElement] }],
    };

    // Act & Assert
    expect(() => scenesFromDeck(deck)).toThrow('Unhandled element type: unknown');
  });
});
