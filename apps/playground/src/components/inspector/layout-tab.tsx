import { nodeById, type Scene } from '@auto-deck/renderer';
import { type ElementId, pixels, type Rect, rect, toPixels } from '@auto-deck/schema';
import { FieldGroup, FieldLegend, FieldSet } from '@auto-deck/ui/components/field';
import { cn } from '@auto-deck/ui/lib/utils';
import type { ReactElement } from 'react';
import { NumberField } from '@/components/inspector/number-field';
import { useDocumentStore } from '@/stores/document';

/**
 * Props for the LayoutTab component.
 */
interface LayoutTabProps {
  /**
   * Extra classes merged onto the host element.
   */
  readonly className?: string;

  /**
   * The scene holding the selected element, or undefined when the deck has no slides.
   */
  readonly scene: Scene | undefined;

  /**
   * The identifier of the element highlighted as selected.
   */
  readonly selectedElementId: ElementId | null;
}

/**
 * Renders the layout controls for the selected element, or a hint when no element is selected.
 *
 * @param props - The props for the LayoutTab component.
 * @returns The layout controls, or a hint when no element is selected.
 */
export function LayoutTab({ className, scene, selectedElementId }: LayoutTabProps): ReactElement {
  const setElementBounds = useDocumentStore((state) => state.setElementBounds);

  const node = scene === undefined ? undefined : nodeById(scene, selectedElementId);
  if (scene === undefined || node === undefined) {
    return <p className={cn('text-muted-foreground', className)}>Select an element to edit its layout.</p>;
  }

  // Rebound as consts because the narrowing above does not reach a hoisted
  // function declaration.
  const sceneId = scene.id;
  const { id: elementId, bounds } = node;

  /**
   * Commits the bounds with the edited fields replaced, so the untouched
   * fields keep their exact EMU values.
   *
   * @param patch - The edited bounds fields.
   */
  function commit(patch: Partial<Rect>): void {
    const next = { ...bounds, ...patch };
    setElementBounds(sceneId, elementId, rect(next.x, next.y, next.w, next.h));
  }

  return (
    <FieldGroup className={className}>
      <FieldSet>
        <FieldLegend variant="label">Position</FieldLegend>
        <FieldGroup className="grid grid-cols-2 gap-2">
          <NumberField
            key={`${node.id}-x`}
            label="X"
            value={Math.round(toPixels(node.bounds.x))}
            onCommit={(x) => commit({ x: pixels(x) })}
          />
          <NumberField
            key={`${node.id}-y`}
            label="Y"
            value={Math.round(toPixels(node.bounds.y))}
            onCommit={(y) => commit({ y: pixels(y) })}
          />
        </FieldGroup>
      </FieldSet>
      <FieldSet>
        <FieldLegend variant="label">Size</FieldLegend>
        <FieldGroup className="grid grid-cols-2 gap-2">
          <NumberField
            key={`${node.id}-w`}
            label="W"
            min={1}
            value={Math.round(toPixels(node.bounds.w))}
            onCommit={(w) => commit({ w: pixels(w) })}
          />
          <NumberField
            key={`${node.id}-h`}
            label="H"
            min={1}
            value={Math.round(toPixels(node.bounds.h))}
            onCommit={(h) => commit({ h: pixels(h) })}
          />
        </FieldGroup>
      </FieldSet>
    </FieldGroup>
  );
}
