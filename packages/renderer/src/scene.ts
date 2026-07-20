import type { ElementId, Rect, Size, SlideId } from '@auto-deck/schema';

/**
 * A content node in a scene: a uniform tree the renderers fold over.
 */
export type SceneNode = TextNode;

/**
 * A text node positioned by absolute bounds.
 */
export interface TextNode {
  readonly kind: 'text';

  /**
   * The id of the element this node was built from.
   */
  readonly id: ElementId;

  /**
   * The bounding box of the text, in EMU.
   */
  readonly bounds: Rect;

  /**
   * The text content of the node.
   */
  readonly text: string;

  /**
   * The child nodes of this node.
   */
  readonly children: readonly SceneNode[];
}

/**
 * A scene represents one slide's content in a uniform tree, independent of the engine's resolved model.
 */
export interface Scene {
  /**
   * The id of the slide this scene was built from.
   */
  readonly id: SlideId;

  /**
   * The canvas (world) the scene is laid out in, in EMU.
   */
  readonly canvas: Size;

  /**
   * The top-level content nodes.
   */
  readonly children: readonly SceneNode[];
}

/**
 * Finds the node built from the given element anywhere in the scene tree.
 *
 * @param scene - The scene to search.
 * @param id - The element id to match, or null when nothing is selected.
 * @returns The matching node, or undefined when the id is null or no node matches.
 */
export function nodeById(scene: Scene, id: ElementId | null | undefined): SceneNode | undefined {
  if (id === null || id === undefined) {
    return undefined;
  }
  return findNode(scene.children, id);
}

/**
 * Depth-first searches the nodes and their descendants for the given id.
 *
 * @param nodes - The nodes to search.
 * @param id - The element id to match.
 * @returns The matching node, or undefined when no node matches.
 */
function findNode(nodes: readonly SceneNode[], id: ElementId): SceneNode | undefined {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }
    const found = findNode(node.children, id);
    if (found !== undefined) {
      return found;
    }
  }
  return undefined;
}
