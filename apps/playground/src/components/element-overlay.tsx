import type { Scene, SceneNode } from '@auto-deck/renderer';
import { type ElementId, emu, type Rect, rect } from '@auto-deck/schema';
import { cn } from '@auto-deck/ui/lib/utils';
import { type PointerEvent, type ReactElement, useRef } from 'react';
import { useDocumentStore } from '@/stores/document';

/**
 * The distance in client pixels a pointer must travel before a press counts
 * as a drag instead of a click.
 */
const DRAG_THRESHOLD_PX = 3;

/**
 * An in-progress drag.
 * The origin anchors every move to the bounds at the start of the drag, so
 * positions derive from absolute pointer travel and rounding never drifts.
 * Held in a ref because nothing rendered depends on it.
 */
interface DragState {
  /**
   * The element being dragged.
   */
  readonly elementId: ElementId;

  /**
   * The element's bounds when the drag started, in EMU.
   */
  readonly origin: Rect;

  /**
   * The pointer position when the drag started, in client pixels.
   */
  readonly startClientX: number;
  readonly startClientY: number;

  /**
   * How many EMU one client pixel covers at the current display size.
   */
  readonly emuPerClientPx: number;
}

/**
 * Props for the ElementOverlay component.
 */
interface ElementOverlayProps {
  /**
   * Extra classes merged onto the host element.
   */
  readonly className?: string;

  /**
   * The scene whose elements the overlay makes interactive.
   */
  readonly scene: Scene;

  /**
   * The identifier of the element highlighted as selected.
   */
  readonly selectedElementId: ElementId | null;
}

/**
 * The interaction layer over a rendered slide: a transparent SVG with one hit
 * area per element for selecting and dragging. Dragging writes the element's
 * bounds to the deck on every pointer move, so the rendered slide underneath
 * follows the pointer live. The overlay draws in EMU while the rendered slide
 * draws in pixels; they align because both viewBoxes start at 0 0 and span the
 * same canvas.
 *
 * @param props - The props for the ElementOverlay component.
 * @returns The overlay element.
 */
export function ElementOverlay({ className, scene, selectedElementId }: ElementOverlayProps): ReactElement {
  const selectElement = useDocumentStore((state) => state.selectElement);
  const moveElement = useDocumentStore((state) => state.moveElement);

  const dragRef = useRef<DragState | null>(null);

  function handlePointerDown(node: SceneNode, event: PointerEvent<SVGRectElement>): void {
    event.stopPropagation();
    selectElement(node.id);

    const svg = event.currentTarget.ownerSVGElement;
    if (svg === null) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      elementId: node.id,
      origin: node.bounds,
      startClientX: event.clientX,
      startClientY: event.clientY,
      emuPerClientPx: scene.canvas.w / svg.getBoundingClientRect().width,
    };
  }

  function handlePointerMove(event: PointerEvent<SVGRectElement>): void {
    const drag = dragRef.current;
    if (drag === null) {
      return;
    }

    const dxPx = event.clientX - drag.startClientX;
    const dyPx = event.clientY - drag.startClientY;
    if (Math.hypot(dxPx, dyPx) < DRAG_THRESHOLD_PX) {
      return;
    }

    // Committing on every move keeps the deck the single source of truth, so
    // the slide, the thumbnails, and the JSON view all follow the drag live.
    moveElement(
      scene.id,
      drag.elementId,
      rect(
        emu(Math.round(drag.origin.x + dxPx * drag.emuPerClientPx)),
        emu(Math.round(drag.origin.y + dyPx * drag.emuPerClientPx)),
        drag.origin.w,
        drag.origin.h,
      ),
    );
  }

  function endDrag(): void {
    dragRef.current = null;
  }

  return (
    <svg
      className={cn('touch-none', className)}
      viewBox={`0 0 ${scene.canvas.w} ${scene.canvas.h}`}
      aria-label="Slide elements"
      onPointerDown={() => selectElement(null)}
    >
      {/* non-scaling-stroke cancels the viewBox scale but not an ancestor CSS
          scale, so the selection stroke divides by --zoom to stay two pixels. */}
      {scene.children.map((node) => (
        <rect
          key={node.id}
          data-element-id={node.id}
          x={node.bounds.x}
          y={node.bounds.y}
          width={node.bounds.w}
          height={node.bounds.h}
          vectorEffect="non-scaling-stroke"
          className={cn(
            'cursor-move fill-transparent',
            node.id === selectedElementId && 'stroke-ring [stroke-width:calc(2/var(--zoom,1))]',
          )}
          onPointerDown={(event) => handlePointerDown(node, event)}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        />
      ))}
    </svg>
  );
}
