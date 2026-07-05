import type { ResolvedDeck, ResolvedElement } from '@auto-deck/engine';
import type { Scene, SceneNode } from './scene';

/**
 * Shared empty child list for leaf nodes.
 */
const NO_CHILDREN: readonly SceneNode[] = [];

/**
 * Transforms a resolved deck into one scene per slide.
 *
 * @param deck - The resolved deck to transform.
 * @returns One scene per slide, in deck order.
 */
export function scenesFromDeck(deck: ResolvedDeck): readonly Scene[] {
  return deck.slides.map((slide) => ({
    id: slide.id,
    canvas: deck.canvas.size,
    children: slide.elements.map(toSceneNode),
  }));
}

/**
 * Transforms a resolved element into its scene node.
 *
 * @param element - The resolved element to transform.
 * @returns The scene node.
 */
function toSceneNode(element: ResolvedElement): SceneNode {
  switch (element.type) {
    case 'text':
      return {
        kind: 'text',
        id: element.id,
        bounds: element.bounds,
        text: element.text,
        children: NO_CHILDREN,
      };
    default: {
      throw new Error(`Unhandled element type: ${element.type}`);
    }
  }
}
