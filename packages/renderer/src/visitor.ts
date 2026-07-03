import type { SceneNode } from './scene';

/**
 * Renders each scene-node kind to a fragment of type T.
 *
 * A reusable building block for implementing a renderer: keyed by the node's
 * discriminant, so adding a node kind breaks the mapped type until every
 * visitor handles it. Every level produces the same T, so a visitor needs only
 * one output type.
 *
 * @typeParam T - The fragment a visitor produces (e.g. an SVG string, a React
 *   node, or void for an imperative canvas draw).
 */
export type SceneVisitor<T> = {
  readonly [K in SceneNode['kind']]: (node: Extract<SceneNode, { readonly kind: K }>, children: readonly T[]) => T;
};

/**
 * Folds the scene graph bottom-up: each node is rendered after its children, so
 * a node's visitor composes from its already-rendered children.
 *
 * @param node - The scene node to render.
 * @param visitor - The visitor that produces each fragment.
 * @returns The node's rendered fragment.
 */
export function renderScene<T>(node: SceneNode, visitor: SceneVisitor<T>): T {
  const children = node.children.map((child) => renderScene(child, visitor));
  return visitor[node.kind](node, children);
}
