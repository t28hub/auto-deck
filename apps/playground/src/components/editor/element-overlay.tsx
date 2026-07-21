import { nodeById, type Scene, type SceneNode } from '@auto-deck/renderer';
import { type ElementId, Emu, type Rect, rect } from '@auto-deck/schema';
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
   * Called with the element whose text editing was requested by a double click.
   */
  readonly onElementEdit: (elementId: ElementId) => void;

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
 * follows the pointer live. The overlay draws in canvas pixels like the
 * rendered slide; drawing in raw EMU would exceed the 2^25 fixed-point limit
 * browsers place on SVG user-space coordinates once an element moves a few
 * slide-widths off the canvas, freezing the hit area while the slide follows
 * the pointer.
 *
 * @param props - The props for the ElementOverlay component.
 * @returns The overlay element.
 */
export function ElementOverlay({
  className,
  onElementEdit,
  scene,
  selectedElementId,
}: ElementOverlayProps): ReactElement {
  const selectElement = useDocumentStore((state) => state.selectElement);
  const setElementBounds = useDocumentStore((state) => state.setElementBounds);

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
    setElementBounds(
      scene.id,
      drag.elementId,
      rect(
        Emu.of(Math.round(drag.origin.x + dxPx * drag.emuPerClientPx)),
        Emu.of(Math.round(drag.origin.y + dyPx * drag.emuPerClientPx)),
        drag.origin.w,
        drag.origin.h,
      ),
    );
  }

  function endDrag(): void {
    dragRef.current = null;
  }

  const selectedNode = nodeById(scene, selectedElementId);

  return (
    <svg
      className={cn('touch-none overflow-visible', className)}
      viewBox={`0 0 ${Emu.toPixels(scene.canvas.w)} ${Emu.toPixels(scene.canvas.h)}`}
      aria-label="Slide elements"
      onPointerDown={() => selectElement(null)}
    >
      {scene.children.map((node) => (
        // biome-ignore lint/a11y/useSemanticElements: an SVG hit area cannot be a native button.
        <rect
          key={node.id}
          role="button"
          aria-label={`Element ${node.text}`}
          data-element-id={node.id}
          x={Emu.toPixels(node.bounds.x)}
          y={Emu.toPixels(node.bounds.y)}
          width={Emu.toPixels(node.bounds.w)}
          height={Emu.toPixels(node.bounds.h)}
          className="cursor-move fill-transparent hover:stroke-1 hover:stroke-selection/50"
          onDoubleClick={() => onElementEdit(node.id)}
          onPointerDown={(event) => handlePointerDown(node, event)}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        />
      ))}

      {selectedNode !== undefined && (
        <rect
          aria-hidden
          x={Emu.toPixels(selectedNode.bounds.x)}
          y={Emu.toPixels(selectedNode.bounds.y)}
          width={Emu.toPixels(selectedNode.bounds.w)}
          height={Emu.toPixels(selectedNode.bounds.h)}
          className="pointer-events-none fill-none stroke-1 stroke-selection"
        />
      )}
    </svg>
  );
}
