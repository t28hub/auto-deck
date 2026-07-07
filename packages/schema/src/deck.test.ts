import { describe, expect, it } from 'vitest';
import { WIDESCREEN_16_9 } from './canvas';
import { deckId, deckSchema } from './deck';

/**
 * Mutable wire-format deck shape; only fields that tests delete are optional.
 */
interface DeckSpec {
  id: string;
  canvas: {
    id: string;
    displayName: string;
    size: {
      w: number;
      h?: number;
    };
  };
  layouts: unknown[];
  slides: unknown[];
}

/**
 * Creates a valid fixture deck in wire format.
 */
function createDeck(): DeckSpec {
  return {
    id: 'deck_000000000001',
    canvas: {
      id: 'canvas_000000000001',
      displayName: 'Widescreen 16:9',
      size: { ...WIDESCREEN_16_9 },
    },
    layouts: [
      {
        id: 'layout-title-content',
        name: 'Title and Content',
        slots: [
          {
            id: 'slot-title',
            styleToken: 'title',
            rect: { x: { ratio: 0 }, y: { ratio: 0 }, w: { ratio: 1 }, h: { ratio: 0.2 } },
          },
        ],
      },
    ],
    slides: [
      {
        id: 'slide_000000000001',
        layoutId: 'layout-title-content',
        elements: [{ id: 'el_000000000001', type: 'text', slot: 'slot-title', text: 'Hello' }],
      },
    ],
  };
}

describe('deckId', () => {
  it('should generate an identifier with the deck prefix', () => {
    // Act
    const actual = deckId();

    // Assert
    expect(actual).toMatch(/^deck_/);
  });
});

describe('deckSchema', () => {
  it('should parse a valid wire-format deck', () => {
    // Arrange
    const deck = createDeck();

    // Act
    const actual = deckSchema.safeParse(deck);

    // Assert
    expect(actual.success).toBe(true);
  });

  it('should reject a canvas size missing a dimension', () => {
    // Arrange
    const deck = createDeck();
    delete deck.canvas.size.h;

    // Act
    const actual = deckSchema.safeParse(deck);

    // Assert
    expect(actual.success).toBe(false);
  });
});
