import type { Scene } from '@auto-deck/renderer';
import { elementIdSchema, pixels, rect, slideIdSchema, WIDESCREEN_16_9 } from '@auto-deck/schema';
import { assert, describe, expect, it } from 'vitest';
import { parseSvg } from '../test/parse-svg';
import { svgRenderer } from './renderer';

/**
 * Builds a one-node scene on a 1280x720 canvas.
 */
function createScene(text: string): Scene {
  return {
    id: slideIdSchema.parse('slide_000000000001'),
    canvas: WIDESCREEN_16_9,
    children: [
      {
        kind: 'text',
        id: elementIdSchema.parse('el_000000000001'),
        bounds: rect(pixels(0), pixels(0), pixels(1280), pixels(144)),
        text,
        children: [],
      },
    ],
  };
}

describe('svgRenderer', () => {
  it('should render a standalone SVG document with a title for accessibility', () => {
    // Act
    const scene = createScene('Hello');
    const actual = svgRenderer.render(scene);

    // Assert
    const parsed = parseSvg(actual);
    expect(parsed.tagName).toBe('svg');
    expect(parsed.getAttribute('xmlns')).toBe('http://www.w3.org/2000/svg');
    expect(parsed.querySelector('title')?.textContent).toBe('slide_000000000001');
    expect(parsed.querySelector('text')?.textContent).toBe('Hello');
  });

  it('should default the viewport to the canvas at 1:1', () => {
    // Act
    const scene = createScene('Hello');
    const actual = svgRenderer.render(scene);

    // Assert
    const parsed = parseSvg(actual);
    expect(parsed.getAttribute('viewBox')).toBe('0 0 1280 720');
    expect(parsed.getAttribute('width')).toBe('1280');
    expect(parsed.getAttribute('height')).toBe('720');
  });

  it('should keep the world viewBox while a custom viewport changes the display size', () => {
    // Act
    const scene = createScene('Hello');
    const actual = svgRenderer.render(scene, { viewport: { width: 640, height: 360 } });

    // Assert
    const parsed = parseSvg(actual);
    expect(parsed.getAttribute('viewBox')).toBe('0 0 1280 720');
    expect(parsed.getAttribute('width')).toBe('640');
    expect(parsed.getAttribute('height')).toBe('360');
  });

  it('should place text in canvas pixels', () => {
    // Act
    const scene = createScene('Hello');
    const actual = svgRenderer.render(scene);

    // Assert
    const text = parseSvg(actual).querySelector('g > text');
    assert(text !== null, 'Expected the text element to draw its text');
    expect(text.getAttribute('x')).toBe('8');
    expect(text.getAttribute('y')).toBe('24');
  });

  it('should escape markup in text content', () => {
    // Act
    const scene = createScene('<script>alert("x&y")</script>');
    const actual = svgRenderer.render(scene);

    // Assert
    expect(actual).not.toContain('<script>');
    expect(actual).toContain('&lt;script&gt;');
    expect(actual).toContain('&amp;');
  });
});
