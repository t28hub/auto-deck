import type { Id } from '@auto-deck/schema';
import type { ResolvedDeck } from '@auto-deck/engine';
import { scenesFromDeck } from '@auto-deck/renderer';
import { svgRenderer } from './renderer';

/**
 * One slide rendered as a standalone SVG document.
 */
export interface SvgSlide {
  readonly slideId: Id;
  readonly svg: string;
}

/**
 * Renders a resolved deck to one standalone SVG document per slide. This is the
 * deck-level orchestration above the per-scene renderer.
 *
 * @param deck - The resolved deck to render.
 * @returns One SVG document per slide, in deck order.
 */
export function renderDeckToSvg(deck: ResolvedDeck): readonly SvgSlide[] {
  return scenesFromDeck(deck).map((scene) => ({
    slideId: scene.id,
    svg: svgRenderer.render(scene),
  }));
}
