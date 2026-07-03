import { resolveDeck } from '@auto-deck/engine';
import { renderDeckToSvg, type SvgSlide } from '@auto-deck/renderer-svg';
import { deckSchema } from '@auto-deck/schema';
import { z } from 'zod';

/**
 * The outcome of compiling deck JSON text into rendered slides.
 */
export type CompileResult =
  | { readonly success: true; readonly slides: readonly SvgSlide[] }
  | { readonly success: false; readonly message: string };

/**
 * Runs the same pipeline as the CLI — parse JSON, validate against the deck
 * schema, resolve, render to SVG — and reports every failure as a formatted
 * message instead of exiting.
 *
 * @param source - The deck JSON text.
 * @returns The rendered slides, or the failure message.
 */
export function compile(source: string): CompileResult {
  let data: unknown;
  try {
    data = JSON.parse(source);
  } catch (error) {
    return {
      success: false,
      message: `Invalid JSON\n  ${error instanceof Error ? error.message : String(error)}`,
    };
  }

  const parsed = deckSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message: `Invalid deck\n${z.prettifyError(parsed.error)}`,
    };
  }

  const result = resolveDeck(parsed.data);
  if (!result.success) {
    const lines = result.diagnostics.map((diagnostic) => `  [${diagnostic.code}] ${diagnostic.message}`);
    return {
      success: false,
      message: `Resolution failed\n${lines.join('\n')}`,
    };
  }

  return { success: true, slides: renderDeckToSvg(result.value) };
}
