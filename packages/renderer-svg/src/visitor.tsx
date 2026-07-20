import type { SceneVisitor } from '@auto-deck/renderer';
import type { ReactElement } from 'react';
import { px } from './units';

/**
 * The text style the visitor draws with until style tokens are interpreted.
 */
export const TEXT_STYLE = {
  fontFamily: 'sans-serif',
  fontSize: 24,
  fill: '#111111',
  padding: 8,
} as const;

/**
 * Renders each scene node to an SVG element in canvas (world) pixels.
 */
export const svgVisitor: SceneVisitor<ReactElement> = {
  text(node) {
    const x = px(node.bounds.x);
    const y = px(node.bounds.y);
    return (
      <g key={node.id} data-element-id={node.id}>
        <text
          x={x + TEXT_STYLE.padding}
          y={y + TEXT_STYLE.fontSize}
          fontFamily={TEXT_STYLE.fontFamily}
          fontSize={TEXT_STYLE.fontSize}
          fill={TEXT_STYLE.fill}
        >
          {node.text}
        </text>
      </g>
    );
  },
};
