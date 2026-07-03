import type { Scene, SceneNode } from './scene';

/**
 * An output format: turns a scene into output, optionally parameterized by a
 * render-time context (e.g. a viewport or a draw target). Multiple renderers can
 * be selected polymorphically, and each owns how it walks the scene and emits.
 *
 * @typeParam TOutput - What rendering the scene produces.
 * @typeParam TContext - Render-time view configuration; defaults to none.
 */
export interface Renderer<TOutput, TContext = void> {
  /**
   * Renders a scene into output.
   *
   * @param scene - The scene to render.
   * @param context - Optional render-time configuration.
   * @returns The rendered output.
   */
  render(scene: Scene, context?: TContext): TOutput;
}

/**
 * Renders each scene-node kind to a fragment of type T.
 *
 * A reusable building block for implementing a {@link Renderer}: keyed by the
 * node's discriminant, so adding a node kind breaks the mapped type until every
 * visitor handles it. Every level produces the same T, so a visitor needs only
 * one output type.
 *
 * @typeParam T - The fragment a visitor produces (e.g. an SVG string, a React
 *   node, or void for an imperative canvas draw).
 */
export type SceneVisitor<T> = {
  readonly [K in SceneNode['kind']]: (
    node: Extract<SceneNode, { readonly kind: K }>,
    children: readonly T[],
  ) => T;
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
