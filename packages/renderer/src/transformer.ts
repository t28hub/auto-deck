import type { ResolvedDeck, ResolvedElement } from '@auto-deck/engine';
import type { Scene, SceneNode } from './scene';

/**
 * Shared empty child list for leaf nodes.
 */
const NO_CHILDREN: readonly SceneNode[] = [];

/**
 * Transforms a resolved deck into one scene per slide. This is the bridge from
 * the engine's resolved output to the renderer's scene model; keeping it out of
 * `scene.ts` lets the scene model stay independent of the engine.
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
    default:
      return assertNever(element.type);
  }
}

/**
 * Asserts that a value is unreachable, failing the type-check if a case is missed.
 *
 * @param value - The value that should be of type never.
 * @returns Never; always throws.
 * @throws {Error} Always.
 */
function assertNever(value: never): never {
  throw new Error(`Unhandled element type: ${String(value)}`);
}
