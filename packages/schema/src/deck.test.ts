import { describe, expect, it } from 'vitest';
import { deckSchema } from './deck';

/**
 * Mutable wire-format deck shape. Arrays are single-element tuples so tests can
 * index them without assertions; only fields that tests delete are optional.
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
  layouts: [
    {
      id: string;
      name: string;
      slots: [
        {
          id: string;
          styleToken: string;
          rect: Record<'x' | 'y' | 'w' | 'h', { ratio: number }>;
        },
      ];
    },
  ];
  slides: [
    {
      id: string;
      layoutId: string;
      elements: [
        {
          id: string;
          type: string;
          slot: string;
          text: string;
        },
      ];
    },
  ];
}

/**
 * Creates a valid fixture deck in wire format.
 */
function createDeck(): DeckSpec {
  return {
    id: 'deck-1',
    canvas: {
      id: 'canvas-1',
      displayName: 'Widescreen 16:9',
      size: { w: 12_192_000, h: 6_858_000 },
    },
    layouts: [
      {
        id: 'title-content',
        name: 'Title and Content',
        slots: [
          {
            id: 'title',
            styleToken: 'title',
            rect: { x: { ratio: 0 }, y: { ratio: 0 }, w: { ratio: 1 }, h: { ratio: 0.2 } },
          },
        ],
      },
    ],
    slides: [
      {
        id: 'slide-1',
        layoutId: 'title-content',
        elements: [{ id: 'el-1', type: 'text', slot: 'title', text: 'Hello' }],
      },
    ],
  };
}

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

  it('should reject a non-integer EMU length', () => {
    // Arrange
    const deck = createDeck();
    deck.canvas.size.w = 12.5;

    // Act
    const actual = deckSchema.safeParse(deck);

    // Assert
    expect(actual.success).toBe(false);
  });

  it('should reject a negative ratio length', () => {
    // Arrange
    const deck = createDeck();
    deck.layouts[0].slots[0].rect.w.ratio = -1;

    // Act
    const actual = deckSchema.safeParse(deck);

    // Assert
    expect(actual.success).toBe(false);
  });

  it('should reject an empty slot id', () => {
    // Arrange
    const deck = createDeck();
    deck.layouts[0].slots[0].id = '';

    // Act
    const actual = deckSchema.safeParse(deck);

    // Assert
    expect(actual.success).toBe(false);
  });

  it('should reject an unknown element type', () => {
    // Arrange
    const deck = createDeck();
    deck.slides[0].elements[0].type = 'video';

    // Act
    const actual = deckSchema.safeParse(deck);

    // Assert
    expect(actual.success).toBe(false);
  });
});
