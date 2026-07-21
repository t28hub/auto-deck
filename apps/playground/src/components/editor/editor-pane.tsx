import { nodeById } from '@auto-deck/renderer';
import { TEXT_STYLE } from '@auto-deck/renderer-svg';
import { type ElementId, Emu } from '@auto-deck/schema';
import { cn } from '@auto-deck/ui/lib/utils';
import { type CSSProperties, type ReactElement, useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CompiledSlide } from '@/compile';
import { ControlBar } from '@/components/editor/control-bar';
import { ElementOverlay } from '@/components/editor/element-overlay';
import { SlideView } from '@/components/slide-view';
import { useZoom } from '@/hooks/use-zoom';
import { useDocumentStore } from '@/stores/document';

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

  const setElementText = useDocumentStore((state) => state.setElementText);
  const [editingElementId, setEditingElementId] = useState<ElementId | null>(null);

  // A stable identity keeps this mount-only, so re-renders while typing do not re-select.
  const focusEditor = useCallback((editor: HTMLTextAreaElement | null): void => {
    editor?.focus();
    editor?.select();
  }, []);

  const canvasWidth = slide?.scene.canvas.w;
  const canvasHeight = slide?.scene.canvas.h;
  const contentSize = useMemo(() => {
    if (canvasWidth === undefined || canvasHeight === undefined) {
      return undefined;
    }
    return { width: Emu.toPixels(canvasWidth), height: Emu.toPixels(canvasHeight) };
  }, [canvasWidth, canvasHeight]);

  const { zoom, zoomIn, zoomOut, zoomToFit, setZoom } = useZoom(scrollRef, contentSize);

  const ready = slide !== undefined && contentSize !== undefined && zoom !== null;

  const editingNode = ready ? nodeById(slide.scene, editingElementId) : undefined;

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
              data-stage=""
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
              <SlideView svg={slide.svg} clipped={false} />
              <ElementOverlay
                className="absolute inset-0 h-full w-full"
                onElementEdit={setEditingElementId}
                scene={slide.scene}
                selectedElementId={selectedElementId}
              />

              {editingNode !== undefined && (
                <style>{`[data-stage] [data-element-id="${editingNode.id}"] text { visibility: hidden; }`}</style>
              )}
              {editingNode !== undefined && (
                <textarea
                  key={editingNode.id}
                  className="absolute resize-none overflow-hidden border-none bg-transparent outline-none"
                  style={{
                    left: Emu.toPixels(editingNode.bounds.x),
                    top: Emu.toPixels(editingNode.bounds.y),
                    width: Emu.toPixels(editingNode.bounds.w),
                    height: Emu.toPixels(editingNode.bounds.h),
                    paddingLeft: TEXT_STYLE.padding,
                    paddingTop: TEXT_STYLE.fontSize * 0.2,
                    fontFamily: TEXT_STYLE.fontFamily,
                    fontSize: TEXT_STYLE.fontSize,
                    lineHeight: `${TEXT_STYLE.fontSize}px`,
                    color: TEXT_STYLE.fill,
                  }}
                  value={editingNode.text}
                  aria-label="Element text"
                  ref={focusEditor}
                  onChange={(event) => setElementText(slide.scene.id, editingNode.id, event.target.value)}
                  onBlur={() => setEditingElementId(null)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === 'Escape') {
                      event.preventDefault();
                      event.currentTarget.blur();
                    }
                  }}
                />
              )}
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
