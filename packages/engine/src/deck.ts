import type { Deck, Emu, Rect } from '@auto-deck/schema';
import { emu, pixels, rect } from '@auto-deck/schema';
import type { ResolveDiagnostic, ResolveResult } from './diagnostic';
import type { ResolvedElement } from './element';
import { type ResolvedSlide, resolveSlide } from './slide';

/**
 * A deck whose every element carries absolute bounds.
 */
export type ResolvedDeck = Omit<Deck, 'layouts' | 'slides'> & {
  readonly slides: readonly ResolvedSlide[];
};

/**
 * Options controlling how a deck is resolved.
 */
export interface ResolveOptions {
  /**
   * The margin around the content area, in EMU.
   */
  readonly margin?: Emu;
}

/**
 * The default margin around the content area, in EMU.
 */
const DEFAULT_MARGIN: Emu = pixels(0);

/**
 * Finds the keys that occur more than once across the items, in first-seen order.
 * Iterates once and reads the key per item, so callers need not build an
 * intermediate array of keys.
 *
 * @param items - The items to scan.
 * @param key - Extracts the comparison key from an item.
 * @returns The distinct keys that occur at least twice.
 */
function duplicatesBy<T, K>(items: Iterable<T>, key: (item: T) => K): K[] {
  const seen = new Set<K>();
  const repeated = new Set<K>();
  for (const item of items) {
    const itemKey = key(item);
    if (seen.has(itemKey)) {
      repeated.add(itemKey);
    } else {
      seen.add(itemKey);
    }
  }
  return [...repeated];
}

/**
 * Yields every element across the given slides without materializing an array.
 *
 * @param slides - The resolved slides to walk.
 * @returns A lazy iterable over all elements.
 */
function* allElements(slides: readonly ResolvedSlide[]): Generator<ResolvedElement> {
  for (const slide of slides) {
    yield* slide.elements;
  }
}

/**
 * Resolves an authored deck into self-contained absolute geometry.
 *
 * @param deck - The authored deck to resolve.
 * @param options - Optional resolution settings.
 * @returns A resolved deck on success, otherwise the collected diagnostics.
 */
export function resolveDeck(deck: Deck, { margin = DEFAULT_MARGIN }: ResolveOptions = {}): ResolveResult<ResolvedDeck> {
  const diagnostics: ResolveDiagnostic[] = [];

  for (const layoutId of duplicatesBy(deck.layouts, (layout) => layout.id)) {
    diagnostics.push({
      code: 'duplicate-layout-id',
      layoutId,
      message: `Layout id "${layoutId}" is used by more than one layout in the deck.`,
    });
  }

  for (const slideId of duplicatesBy(deck.slides, (slide) => slide.id)) {
    diagnostics.push({
      code: 'duplicate-slide-id',
      slideId,
      message: `Slide id "${slideId}" is used by more than one slide in the deck.`,
    });
  }

  const layoutsById = new Map(deck.layouts.map((layout) => [layout.id, layout] as const));
  const area: Rect = rect(margin, margin, emu(deck.canvas.size.w - 2 * margin), emu(deck.canvas.size.h - 2 * margin));

  const slides: ResolvedSlide[] = [];
  for (const slide of deck.slides) {
    const layout = layoutsById.get(slide.layoutId);
    if (layout === undefined) {
      diagnostics.push({
        code: 'unknown-layout',
        slideId: slide.id,
        layoutId: slide.layoutId,
        message: `Slide "${slide.id}" references unknown layout "${slide.layoutId}".`,
      });
      continue;
    }
    const result = resolveSlide(slide, layout, area);
    if (result.success) {
      slides.push({ id: slide.id, elements: result.value });
    } else {
      diagnostics.push(...result.diagnostics);
    }
  }

  for (const elementId of duplicatesBy(allElements(slides), (element) => element.id)) {
    diagnostics.push({
      code: 'duplicate-element-id',
      elementId,
      message: `Element id "${elementId}" is used by more than one element in the deck.`,
    });
  }

  if (diagnostics.length > 0) {
    return { success: false, diagnostics };
  }
  return {
    success: true,
    value: { id: deck.id, canvas: deck.canvas, slides },
  };
}
