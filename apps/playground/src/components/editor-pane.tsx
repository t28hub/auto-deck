import { type ElementId, toPixels } from '@auto-deck/schema';
import { cn } from '@auto-deck/ui/lib/utils';
import { type CSSProperties, type ReactElement, useLayoutEffect, useMemo, useRef } from 'react';
import type { CompiledSlide } from '@/compile';
import { ControlBar } from '@/components/control-bar';
import { ElementOverlay } from '@/components/element-overlay';
import { SlideView } from '@/components/slide-view';
import { useZoom } from '@/hooks/use-zoom';

/**
 * Props for the EditorPane component.
 */
interface EditorPaneProps {
  /**
   * Extra classes merged onto the host element.
   */
  readonly className?: string;

  /**
   * The identifier of the element highlighted as selected.
   */
  readonly selectedElementId: ElementId | null;

  /**
   * The slide being edited, or undefined when the deck has no slides.
   */
  readonly slide: CompiledSlide | undefined;
}

/**
 * The editor showing the slide being edited, with an interaction overlay for
 * selecting and dragging its elements, and a floating zoom control.
 *
 * @param props - The props for the EditorPane component.
 * @returns The editor region.
 */
export function EditorPane({ className, selectedElementId, slide }: EditorPaneProps): ReactElement {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const spacerRef = useRef<HTMLDivElement | null>(null);
  const previousZoomRef = useRef<number | null>(null);

  const canvasWidth = slide?.scene.canvas.w;
  const canvasHeight = slide?.scene.canvas.h;
  const contentSize = useMemo(() => {
    if (canvasWidth === undefined || canvasHeight === undefined) {
      return undefined;
    }
    return { width: toPixels(canvasWidth), height: toPixels(canvasHeight) };
  }, [canvasWidth, canvasHeight]);

  const { zoom, zoomIn, zoomOut, zoomToFit, setZoom } = useZoom(scrollRef, contentSize);

  const ready = slide !== undefined && contentSize !== undefined && zoom !== null;

  // When the zoom changes, we want to keep the same point in the slide centered in the scroll region.
  useLayoutEffect(() => {
    const scroll = scrollRef.current;
    const spacer = spacerRef.current;
    const previousZoom = previousZoomRef.current;
    previousZoomRef.current = zoom;

    if (zoom === null || previousZoom === null || previousZoom === zoom || scroll === null || spacer === null) {
      return;
    }

    const scrollRect = scroll.getBoundingClientRect();
    const spacerRect = spacer.getBoundingClientRect();
    const anchorX = (scrollRect.left + scroll.clientWidth / 2 - spacerRect.left) / spacerRect.width;
    const anchorY = (scrollRect.top + scroll.clientHeight / 2 - spacerRect.top) / spacerRect.height;

    let lastWidth = -1;
    let lastHeight = -1;
    let frame = requestAnimationFrame(function step(): void {
      const currentScrollRect = scroll.getBoundingClientRect();
      const currentSpacerRect = spacer.getBoundingClientRect();
      const contentLeft = currentSpacerRect.left - currentScrollRect.left + scroll.scrollLeft;
      const contentTop = currentSpacerRect.top - currentScrollRect.top + scroll.scrollTop;
      scroll.scrollLeft = contentLeft + anchorX * currentSpacerRect.width - scroll.clientWidth / 2;
      scroll.scrollTop = contentTop + anchorY * currentSpacerRect.height - scroll.clientHeight / 2;

      const settled = currentSpacerRect.width === lastWidth && currentSpacerRect.height === lastHeight;
      lastWidth = currentSpacerRect.width;
      lastHeight = currentSpacerRect.height;
      if (!settled) {
        frame = requestAnimationFrame(step);
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [zoom]);

  return (
    <section className={cn('relative h-full bg-muted', className)} aria-label="Editor">
      <div ref={scrollRef} className="flex h-full overflow-auto p-4">
        {ready && (
          <div
            ref={spacerRef}
            className="relative m-auto shrink-0 shadow-md transition-[width,height] duration-200 ease-out"
            style={{ width: contentSize.width * zoom, height: contentSize.height * zoom }}
          >
            <div
              className="relative origin-top-left transition-transform duration-200 ease-out"
              style={
                {
                  width: contentSize.width,
                  height: contentSize.height,
                  transform: `scale(${zoom})`,
                  '--zoom': zoom,
                } as CSSProperties
              }
            >
              <SlideView svg={slide.svg} />
              <ElementOverlay
                className="absolute inset-0 h-full w-full"
                scene={slide.scene}
                selectedElementId={selectedElementId}
              />
            </div>
          </div>
        )}
      </div>

      {ready && (
        <ControlBar
          className="absolute right-3 bottom-3"
          onZoomChange={setZoom}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onZoomToFit={zoomToFit}
          zoom={zoom}
        />
      )}
    </section>
  );
}
