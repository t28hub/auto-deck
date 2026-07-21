import type { Deck, Rect } from '@auto-deck/schema';
import { Emu, rect } from '@auto-deck/schema';
import type { ResolveDiagnostic, ResolveResult } from './diagnostic';
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
const DEFAULT_MARGIN: Emu = Emu.fromPixels(0);

/**
 * Finds the keys that occur more than once across the items, in first-seen order.
 *
 * @param items - The items to scan.
 * @param key - Extracts the comparison key from an item.
 * @returns The distinct keys that occur at least twice.
 */
function duplicatesBy<T, K>(items: readonly T[], key: (item: T) => K): K[] {
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

  const allElements = deck.slides.flatMap((slide) => slide.elements);
  for (const elementId of duplicatesBy(allElements, (element) => element.id)) {
    diagnostics.push({
      code: 'duplicate-element-id',
      elementId,
      message: `Element id "${elementId}" is used by more than one element in the deck.`,
    });
  }

  const contentW = deck.canvas.size.w - 2 * margin;
  const contentH = deck.canvas.size.h - 2 * margin;
  if (contentW <= 0 || contentH <= 0) {
    diagnostics.push({
      code: 'invalid-content-area',
      message: `The margin (${margin} EMU) leaves no content area on the ${deck.canvas.size.w}x${deck.canvas.size.h} EMU canvas.`,
    });
    return { success: false, diagnostics };
  }
  const area: Rect = rect(margin, margin, Emu.of(contentW), Emu.of(contentH));

  const layoutsById = new Map(deck.layouts.map((layout) => [layout.id, layout] as const));
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
      slides.push(result.value);
    } else {
      diagnostics.push(...result.diagnostics);
    }
  }

  if (diagnostics.length > 0) {
    return { success: false, diagnostics };
  }
  return {
    success: true,
    value: { id: deck.id, canvas: deck.canvas, slides },
  };
}
