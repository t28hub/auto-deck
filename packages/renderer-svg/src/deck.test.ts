import { type ResolvedDeck, resolveDeck } from '@auto-deck/engine';
import { deckSchema, WIDESCREEN_16_9 } from '@auto-deck/schema';
import { assert, describe, expect, it } from 'vitest';
import { parseSvg } from '../test/parse-svg';
import { renderDeck } from './deck';

/**
 * Resolves the shared two-slide fixture deck, failing fast if it is invalid.
 */
function resolveFixtureDeck(): ResolvedDeck {
  const deck = deckSchema.parse({
    id: 'deck-1',
    canvas: {
      id: 'canvas-1',
      displayName: 'Widescreen 16:9',
      size: WIDESCREEN_16_9,
    },
    layouts: [
      {
        id: 'layout-1',
        name: 'Layout',
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
        layoutId: 'layout-1',
        elements: [{ id: 'el-1', type: 'text', slot: 'title', text: 'Hello' }],
      },
      {
        id: 'slide-2',
        layoutId: 'layout-1',
        elements: [{ id: 'el-2', type: 'text', slot: 'title', text: 'World' }],
      },
    ],
  });
  const result = resolveDeck(deck);
  assert(result.success, 'fixture deck must resolve');
  return result.value;
}

describe('renderDeck', () => {
  it('should render one SVG document per slide, paired with its slide id', () => {
    // Act
    const deck = resolveFixtureDeck();
    const actual = renderDeck(deck);

    // Assert
    expect(actual.map((slide) => slide.slideId)).toEqual(['slide-1', 'slide-2']);
    const texts = actual.map((slide) => parseSvg(slide.svg).querySelector('text')?.textContent);
    expect(texts).toEqual(['Hello', 'World']);
  });
});
