import { resolveDeck } from '@auto-deck/engine';
import { type Scene, scenesFromDeck } from '@auto-deck/renderer';
import { svgRenderer } from '@auto-deck/renderer-svg';
import type { Deck } from '@auto-deck/schema';

/**
 * One slide compiled for the playground, pairing the rendered SVG document
 * with the scene it was rendered from so interactive layers can reach the
 * element bounds.
 */
export interface CompiledSlide {
  /**
   * The slide's standalone SVG document.
   */
  readonly svg: string;

  /**
   * The scene the SVG was rendered from.
   */
  readonly scene: Scene;
}

/**
 * The outcome of compiling a deck into rendered slides.
 */
export type CompileResult =
  | { readonly success: true; readonly slides: readonly CompiledSlide[] }
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

  return {
    success: true,
    slides: scenesFromDeck(result.value).map((scene) => ({
      svg: svgRenderer.render(scene),
      scene,
    })),
  };
}
