import { Emu, elementId, rect } from '@auto-deck/schema';
import { describe, expect, it } from 'vitest';
import type { TextNode } from './scene';
import { renderScene, type SceneVisitor } from './visitor';

/**
 * Builds a text node with optional children for exercising the fold.
 */
function textNode(text: string, children: readonly TextNode[] = []): TextNode {
  return {
    kind: 'text',
    id: elementId(),
    bounds: rect(Emu.fromPixels(0), Emu.fromPixels(0), Emu.fromPixels(10), Emu.fromPixels(10)),
    text,
    children,
  };
}

/**
 * Renders a node as `text(child,child)` so composition order is observable.
 */
const traceVisitor: SceneVisitor<string> = {
  text(node, children) {
    return children.length === 0 ? node.text : `${node.text}(${children.join(',')})`;
  },
};

describe('renderScene', () => {
  it('should render a leaf node', () => {
    // Act
    const leafNode = textNode('leaf');
    const actual = renderScene(leafNode, traceVisitor);

    // Assert
    expect(actual).toBe('leaf');
  });

  it('should fold bottom-up, passing rendered children to the parent in order', () => {
    // Act
    const treeNode = textNode('root', [textNode('a'), textNode('b', [textNode('c')])]);
    const actual = renderScene(treeNode, traceVisitor);

    // Assert
    expect(actual).toBe('root(a,b(c))');
  });
});
