import { type RefObject, useCallback, useLayoutEffect, useState } from 'react';
import { clamp } from '@/lib/math';

/**
 * The zoom stops the zoom in and zoom out operations step through.
 */
const ZOOM_STOPS = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 2.0, 4.0];

/**
 * The lower bound of the zoom range.
 */
const MIN_ZOOM = 0.1;

/**
 * The upper bound of the zoom range.
 */
const MAX_ZOOM = 4.0;

/**
 * The natural pixel size of the zoomed content.
 */
export interface ContentSize {
  /**
   * The natural width in pixels.
   */
  readonly width: number;

  /**
   * The natural height in pixels.
   */
  readonly height: number;
}

/**
 * The zoom value and operations returned by the useZoom hook.
 */
interface UseZoomResult {
  /**
   * The current zoom, or null while the first fit is pending.
   */
  readonly zoom: number | null;

  /**
   * Steps the zoom up to the next stop.
   */
  readonly zoomIn: () => void;

  /**
   * Steps the zoom down to the previous stop.
   */
  readonly zoomOut: () => void;

  /**
   * Sets the zoom fitting the content inside the container as it measures now.
   */
  readonly zoomToFit: () => void;

  /**
   * Sets the zoom directly, clamped into the zoom range.
   */
  readonly setZoom: (zoom: number) => void;
}

/**
 * A hook that tracks the zoom of content inside a scroll container, starting
 * with an initial fit and providing operations to change the zoom.
 *
 * @param containerRef - The scroll container the fit measures against.
 * @param contentSize - The content's natural pixel size, or undefined while there is none.
 * @returns The current zoom and the operations that change it.
 */
export function useZoom(
  containerRef: RefObject<HTMLElement | null>,
  contentSize: ContentSize | undefined,
): UseZoomResult {
  const [zoom, setZoomState] = useState<number | null>(null);

  const zoomToFit = useCallback((): void => {
    if (contentSize === undefined || containerRef.current === null) {
      return;
    }
    setZoomState(fitZoom(containerRef.current, contentSize));
  }, [contentSize, containerRef]);

  useLayoutEffect(() => {
    if (zoom !== null) {
      return;
    }
    zoomToFit();
  }, [zoom, zoomToFit]);

  const zoomIn = useCallback((): void => {
    setZoomState((current) => {
      if (current === null) {
        return current;
      }
      return ZOOM_STOPS.find((stop) => stop > current) ?? current;
    });
  }, []);

  const zoomOut = useCallback((): void => {
    setZoomState((current) => {
      if (current === null) {
        return current;
      }
      return ZOOM_STOPS.findLast((stop) => stop < current) ?? current;
    });
  }, []);

  const setZoom = useCallback((next: number): void => {
    // Ignore NaN instead of corrupting the zoom; infinities clamp to the ends.
    if (Number.isNaN(next)) {
      return;
    }
    setZoomState(clamp(next, MIN_ZOOM, MAX_ZOOM));
  }, []);

  return { zoom, zoomIn, zoomOut, zoomToFit, setZoom };
}

/**
 * Fits the content inside the container, returning the zoom that makes it fit, clamped into the zoom range.
 *
 * @param container - The scroll container hosting the content.
 * @param content - The natural pixel size of the fitted content.
 * @returns The fitting zoom, clamped into the zoom range.
 */
function fitZoom(container: HTMLElement, content: ContentSize): number {
  // The || 0 fallbacks treat environments that report no computed padding,
  // such as happy-dom, as zero padding.
  const style = getComputedStyle(container);

  const paddingX = (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
  const width = container.clientWidth - paddingX;
  const fitX = width / content.width;

  const paddingY = (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0);
  const height = container.clientHeight - paddingY;
  const fitY = height / content.height;

  const zoom = Math.min(fitX, fitY);
  return clamp(zoom, MIN_ZOOM, MAX_ZOOM);
}
