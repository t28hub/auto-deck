import { elementId, pixels, rect, slideId, WIDESCREEN_16_9 } from '@auto-deck/schema';
import { describe, expect, it } from 'vitest';
import { nodeById, type Scene, type SceneNode } from './scene';

/**
 * Builds a text node with optional children.
 */
function textNode(children: readonly SceneNode[] = []): SceneNode {
  return {
    kind: 'text',
    id: elementId(),
    bounds: rect(pixels(0), pixels(0), pixels(10), pixels(10)),
    text: 'node',
    children,
  };
}

/**
 * Wraps the nodes in a scene on a widescreen canvas.
 */
function sceneOf(children: readonly SceneNode[]): Scene {
  return { id: slideId(), canvas: WIDESCREEN_16_9, children };
}

describe('nodeById', () => {
  it('should find a top-level node', () => {
    const target = textNode();
    const scene = sceneOf([textNode(), target, textNode()]);
    expect(nodeById(scene, target.id)).toBe(target);
  });

  it('should find a node nested below the top level', () => {
    const target = textNode();
    const scene = sceneOf([textNode([textNode([target])])]);
    expect(nodeById(scene, target.id)).toBe(target);
  });

  it('should return undefined when no node matches', () => {
    const scene = sceneOf([textNode(), textNode()]);
    expect(nodeById(scene, elementId())).toBeUndefined();
  });

  it('should return undefined when the id is null', () => {
    const target = textNode();
    const scene = sceneOf([target]);
    expect(nodeById(scene, null)).toBeUndefined();
  });
});
