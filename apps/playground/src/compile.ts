import { resolveDeck } from '@auto-deck/engine';
import { renderDeck, type SvgSlide } from '@auto-deck/renderer-svg';
import type { Deck } from '@auto-deck/schema';

/**
 * The outcome of compiling a deck into rendered slides.
 */
export type CompileResult =
  | { readonly success: true; readonly slides: readonly SvgSlide[] }
  | { readonly success: false; readonly message: string };

/**
 * Resolves the deck and renders it to SVG, reporting resolution failures as a
 * formatted message instead of throwing.
 *
 * @param deck - The deck to compile.
 * @returns The rendered slides, or the failure message.
 */
export function compile(deck: Deck): CompileResult {
  const result = resolveDeck(deck);
  if (!result.success) {
    const lines = result.diagnostics.map((diagnostic) => `  [${diagnostic.code}] ${diagnostic.message}`);
    return {
      success: false,
      message: `Resolution failed\n${lines.join('\n')}`,
    };
  }

  return { success: true, slides: renderDeck(result.value) };
}
