import type { ReactElement } from 'react';
import type { SceneVisitor } from '@auto-deck/renderer';
import { px } from './units';

/**
 * The default text size, in pixels, used until style tokens are interpreted.
 */
const DEFAULT_FONT_SIZE = 24;

/**
 * The inset, in pixels, of text from its bounding box.
 */
const TEXT_PADDING = 8;

/**
 * Renders each scene node to an SVG element in canvas (world) pixels.
 */
export const svgVisitor: SceneVisitor<ReactElement> = {
  text(node) {
    const x = px(node.bounds.x);
    const y = px(node.bounds.y);
    const w = px(node.bounds.w);
    const h = px(node.bounds.h);
    return (
      <g key={node.id}>
        <rect x={x} y={y} width={w} height={h} fill="none" stroke="#cccccc" />
        <text
          x={x + TEXT_PADDING}
          y={y + DEFAULT_FONT_SIZE}
          fontFamily="sans-serif"
          fontSize={DEFAULT_FONT_SIZE}
          fill="#111111"
        >
          {node.text}
        </text>
      </g>
    );
  },
};
