import { act, renderHook } from '@testing-library/react';
import type { RefObject } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { type ContentSize, useZoom } from './use-zoom';

/**
 * The natural pixel size of the zoomed content, shaped like a 16:9 slide.
 */
const CONTENT_SIZE = { width: 1920, height: 1080 };

/**
 * Creates a ref to a container element with the given client size. The
 * container joins the document because computed styles resolve only for
 * connected elements, and the test environment does no layout, so the client
 * size is stubbed on the element.
 *
 * @param clientWidth - The client width in pixels.
 * @param clientHeight - The client height in pixels.
 * @returns The ref holding the container.
 */
function createContainer(clientWidth: number, clientHeight: number): RefObject<HTMLElement> {
  const container = document.createElement('div');
  document.body.appendChild(container);
  stubClientSize(container, clientWidth, clientHeight);
  return { current: container };
}

/**
 * Stubs the client size the element reports. The test environment does no
 * layout, so own properties shadow the prototype getters that return zero.
 *
 * @param container - The element to stub.
 * @param clientWidth - The client width in pixels.
 * @param clientHeight - The client height in pixels.
 */
function stubClientSize(container: HTMLElement, clientWidth: number, clientHeight: number): void {
  Object.defineProperty(container, 'clientWidth', { value: clientWidth, configurable: true });
  Object.defineProperty(container, 'clientHeight', { value: clientHeight, configurable: true });
}

describe('useZoom', () => {
  afterEach(() => {
    // Teardown
    document.body.innerHTML = '';
  });

  it('should fit the content into the container on mount', () => {
    // Setup
    const containerRef = createContainer(960, 2000);

    // Exercise
    const { result } = renderHook(() => useZoom(containerRef, CONTENT_SIZE));

    // Verify
    const actual = result.current;
    expect(actual.zoom).toBe(0.5);
  });

  it('should subtract the container padding from the fit measurement', () => {
    // Setup
    const containerRef = createContainer(992, 2000);
    containerRef.current.style.padding = '16px';

    // Exercise
    const { result } = renderHook(() => useZoom(containerRef, CONTENT_SIZE));

    // Verify
    const actual = result.current;
    expect(actual.zoom).toBe(0.5);
  });

  it('should clamp the fit of an oversized container to the maximum zoom', () => {
    // Setup
    const containerRef = createContainer(19_200, 10_800);

    // Exercise
    const { result } = renderHook(() => useZoom(containerRef, CONTENT_SIZE));

    // Verify
    const actual = result.current;
    expect(actual.zoom).toBe(4);
  });

  it('should clamp the fit of a tiny container to the minimum zoom', () => {
    // Setup
    const containerRef = createContainer(64, 64);

    // Exercise
    const { result } = renderHook(() => useZoom(containerRef, CONTENT_SIZE));

    // Verify
    const actual = result.current;
    expect(actual.zoom).toBe(0.1);
  });

  it('should leave the zoom pending while there is no content', () => {
    // Setup
    const containerRef = createContainer(960, 2000);

    // Exercise
    const { result } = renderHook(() => useZoom(containerRef, undefined));

    // Verify
    const actual = result.current;
    expect(actual.zoom).toBeNull();
  });

  it('should leave the zoom pending while there is no container', () => {
    // Exercise
    const { result } = renderHook(() => useZoom({ current: null }, CONTENT_SIZE));

    // Verify
    const actual = result.current;
    expect(actual.zoom).toBeNull();
  });

  it('should fit the content once it arrives', () => {
    // Setup
    const containerRef = createContainer(960, 2000);
    const { result, rerender } = renderHook((content: ContentSize | undefined) => useZoom(containerRef, content), {
      initialProps: undefined,
    });

    // Exercise
    rerender(CONTENT_SIZE);

    // Verify
    const actual = result.current;
    expect(actual.zoom).toBe(0.5);
  });

  it('should keep the zoom when the container resizes', () => {
    // Setup
    const containerRef = createContainer(960, 2000);
    const { result, rerender } = renderHook(() => useZoom(containerRef, CONTENT_SIZE));

    // Exercise
    stubClientSize(containerRef.current, 1920, 2000);
    rerender();

    // Verify
    const actual = result.current;
    expect(actual.zoom).toBe(0.5);
  });

  it('should keep the zoom when the content size changes', () => {
    // Setup
    const containerRef = createContainer(960, 2000);
    const { result, rerender } = renderHook((content: ContentSize) => useZoom(containerRef, content), {
      initialProps: CONTENT_SIZE,
    });

    // Exercise
    rerender({ width: 960, height: 540 });

    // Verify
    const actual = result.current;
    expect(actual.zoom).toBe(0.5);
  });

  describe('zoomIn', () => {
    it('should step the zoom up to the next stop', () => {
      // Setup
      const containerRef = createContainer(960, 2000);
      const { result } = renderHook(() => useZoom(containerRef, CONTENT_SIZE));

      // Exercise
      act(() => result.current.zoomIn());

      // Verify
      const actual = result.current;
      expect(actual.zoom).toBe(0.75);
    });

    it('should step the zoom between stops up to the next stop', () => {
      // Setup
      const containerRef = createContainer(960, 2000);
      const { result } = renderHook(() => useZoom(containerRef, CONTENT_SIZE));
      act(() => result.current.setZoom(1.2));

      // Exercise
      act(() => result.current.zoomIn());

      // Verify
      const actual = result.current;
      expect(actual.zoom).toBe(1.25);
    });

    it('should keep the zoom at the last stop', () => {
      // Setup
      const containerRef = createContainer(960, 2000);
      const { result } = renderHook(() => useZoom(containerRef, CONTENT_SIZE));
      act(() => result.current.setZoom(4));

      // Exercise
      act(() => result.current.zoomIn());

      // Verify
      const actual = result.current;
      expect(actual.zoom).toBe(4);
    });

    it('should do nothing while the first fit is pending', () => {
      // Setup
      const containerRef = createContainer(960, 2000);
      const { result } = renderHook(() => useZoom(containerRef, undefined));

      // Exercise
      act(() => result.current.zoomIn());

      // Verify
      const actual = result.current;
      expect(actual.zoom).toBeNull();
    });
  });

  describe('zoomOut', () => {
    it('should step the zoom down to the previous stop', () => {
      // Setup
      const containerRef = createContainer(960, 2000);
      const { result } = renderHook(() => useZoom(containerRef, CONTENT_SIZE));

      // Exercise
      act(() => result.current.zoomOut());

      // Verify
      const actual = result.current;
      expect(actual.zoom).toBe(0.25);
    });

    it('should step the zoom between stops down to the previous stop', () => {
      // Setup
      const containerRef = createContainer(960, 2000);
      const { result } = renderHook(() => useZoom(containerRef, CONTENT_SIZE));
      act(() => result.current.setZoom(0.6));

      // Exercise
      act(() => result.current.zoomOut());

      // Verify
      const actual = result.current;
      expect(actual.zoom).toBe(0.5);
    });

    it('should keep the zoom at the first stop', () => {
      // Setup
      const containerRef = createContainer(960, 2000);
      const { result } = renderHook(() => useZoom(containerRef, CONTENT_SIZE));
      act(() => result.current.setZoom(0.25));

      // Exercise
      act(() => result.current.zoomOut());

      // Verify
      const actual = result.current;
      expect(actual.zoom).toBe(0.25);
    });

    it('should do nothing while the first fit is pending', () => {
      // Setup
      const containerRef = createContainer(960, 2000);
      const { result } = renderHook(() => useZoom(containerRef, undefined));

      // Exercise
      act(() => result.current.zoomOut());

      // Verify
      const actual = result.current;
      expect(actual.zoom).toBeNull();
    });
  });

  describe('zoomToFit', () => {
    it('should refit the content to the container as it measures now', () => {
      // Setup
      const containerRef = createContainer(960, 2000);
      const { result } = renderHook(() => useZoom(containerRef, CONTENT_SIZE));
      stubClientSize(containerRef.current, 1920, 2000);

      // Exercise
      act(() => result.current.zoomToFit());

      // Verify
      const actual = result.current;
      expect(actual.zoom).toBe(1);
    });

    it('should do nothing while there is no content to fit', () => {
      // Setup
      const containerRef = createContainer(960, 2000);
      const { result } = renderHook(() => useZoom(containerRef, undefined));

      // Exercise
      act(() => result.current.zoomToFit());

      // Verify
      const actual = result.current;
      expect(actual.zoom).toBeNull();
    });
  });

  describe('setZoom', () => {
    it.each([
      { value: 1.3, expected: 1.3 },
      { value: 10, expected: 4 },
      { value: 0, expected: 0.1 },
      { value: Number.POSITIVE_INFINITY, expected: 4 },
      { value: Number.NEGATIVE_INFINITY, expected: 0.1 },
    ])('should set the zoom to $expected when given $value', ({ value, expected }) => {
      // Setup
      const containerRef = createContainer(960, 2000);
      const { result } = renderHook(() => useZoom(containerRef, CONTENT_SIZE));

      // Exercise
      act(() => result.current.setZoom(value));

      // Verify
      const actual = result.current;
      expect(actual.zoom).toBe(expected);
    });

    it('should ignore NaN and keep the zoom unchanged', () => {
      // Setup
      const containerRef = createContainer(960, 2000);
      const { result } = renderHook(() => useZoom(containerRef, CONTENT_SIZE));
      expect(result.current.zoom).toBe(0.5);

      // Exercise
      act(() => result.current.setZoom(Number.NaN));

      // Verify
      const actual = result.current;
      expect(actual.zoom).toBe(0.5);
    });
  });
});
