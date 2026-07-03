import { renderToStaticMarkup } from 'react-dom/server';
import { renderScene, type Renderer, type Viewport } from '@auto-deck/renderer';
import { px } from './units';
import { svgVisitor } from './visitor';

/**
 * Render-time configuration for the SVG renderer.
 */
export interface SvgContext {
  /**
   * The viewport to display each slide in; defaults to the canvas at 1:1.
   */
  readonly viewport?: Viewport;
}

/**
 * The SVG namespace. React does not add it to string output, and a standalone
 * SVG file needs it.
 */
const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Renders one scene to a standalone SVG document.
 *
 * The viewBox is the canvas (world) space so element coordinates map directly;
 * the width and height come from the viewport, so the same scene displays at any
 * size. Serialization and escaping are delegated to React's static markup
 * renderer.
 */
export const svgRenderer: Renderer<string, SvgContext> = {
  render(scene, context) {
    const world: Viewport = { width: px(scene.canvas.w), height: px(scene.canvas.h) };
    const viewport = context?.viewport ?? world;
    return renderToStaticMarkup(
      <svg
        xmlns={SVG_NS}
        viewBox={`0 0 ${world.width} ${world.height}`}
        width={viewport.width}
        height={viewport.height}
      >
        <rect x={0} y={0} width={world.width} height={world.height} fill="#ffffff" />
        {scene.children.map((node) => renderScene(node, svgVisitor))}
      </svg>,
    );
  },
};
