import {
  canvasId,
  type Deck,
  deckId,
  type Element,
  Emu,
  elementId,
  layoutIdSchema,
  rect,
  type Slide,
  size,
  slideId,
} from '@auto-deck/schema';

/**
 * Builds a text element with the given text and bounds, for tests.
 *
 * @param text - The element text.
 * @param x - The left edge in EMU.
 * @param y - The top edge in EMU.
 * @param w - The width in EMU.
 * @param h - The height in EMU.
 * @returns The text element.
 */
export function textElement(text: string, x = 0, y = 0, w = 100, h = 50): Element {
  return { id: elementId(), type: 'text', text, bounds: rect(Emu.of(x), Emu.of(y), Emu.of(w), Emu.of(h)) };
}

/**
 * Builds a slide holding the given elements, for tests.
 *
 * @param elements - The elements on the slide.
 * @returns The slide.
 */
export function slideWith(elements: readonly Element[]): Slide {
  return { id: slideId(), layoutId: layoutIdSchema.parse('layout-basic'), elements };
}

/**
 * Builds a deck holding the given slides, for tests.
 *
 * @param slides - The slides in the deck.
 * @returns The deck.
 */
export function deckWith(slides: readonly Slide[]): Deck {
  return {
    id: deckId(),
    canvas: { id: canvasId(), displayName: 'Test', size: size(Emu.of(9600), Emu.of(5400)) },
    layouts: [],
    slides,
  };
}

/**
 * Returns the single element of a single-element, single-slide deck.
 *
 * @param deck - The deck to read.
 * @returns The element.
 * @throws {Error} If the deck does not hold exactly one element on its first slide.
 */
export function onlyElement(deck: Deck): Element {
  const element = deck.slides[0]?.elements[0];
  if (element === undefined) {
    throw new Error('expected the deck to hold an element');
  }
  return element;
}

/**
 * Returns the text of the single element of a single-element deck.
 *
 * @param deck - The deck to read.
 * @returns The element text.
 * @throws {Error} If the element is not a text element.
 */
export function onlyText(deck: Deck): string {
  const element = onlyElement(deck);
  if (element.type !== 'text') {
    throw new Error('expected a text element');
  }
  return element.text;
}
