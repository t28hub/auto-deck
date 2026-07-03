import type { Scene } from './scene';

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
