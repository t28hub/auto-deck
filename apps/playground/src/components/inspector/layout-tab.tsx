import { nodeById, type Scene } from '@auto-deck/renderer';
import { type ElementId, Emu, type Rect, rect } from '@auto-deck/schema';
import { FieldGroup, FieldLegend, FieldSet } from '@auto-deck/ui/components/field';
import { cn } from '@auto-deck/ui/lib/utils';
import type { ReactElement } from 'react';
import { NumberField } from '@/components/inspector/number-field';
import { useDeckStore } from '@/stores/document';

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
  const store = useDeckStore();

  const node = scene === undefined ? undefined : nodeById(scene, selectedElementId);
  if (scene === undefined || node === undefined) {
    return <p className={cn('text-muted-foreground', className)}>Select an element to edit its layout.</p>;
  }

  // Rebound as consts because the narrowing above does not reach a hoisted
  // function declaration.
  const sceneId = scene.id;
  const { id: elementId, bounds } = node;

  /**
   * Commits the bounds with the edited field replaced, so the untouched
   * fields keep their exact EMU values. The per-field key merges the
   * keystrokes of one field edit into a single undo step, named after
   * whether the field positions or sizes the element.
   *
   * @param field - The edited bounds field.
   * @param value - The field's new value.
   */
  function commit(field: keyof Rect, value: Emu): void {
    const next = { ...bounds, [field]: value };
    store?.dispatch(
      { type: 'setElementBounds', slideId: sceneId, elementId, bounds: rect(next.x, next.y, next.w, next.h) },
      {
        coalesceKey: `bounds:${elementId}:${field}`,
        label: field === 'x' || field === 'y' ? 'Move element' : 'Resize element',
      },
    );
  }

  return (
    <FieldGroup className={className}>
      <FieldSet>
        <FieldLegend variant="label">Position</FieldLegend>
        <FieldGroup className="grid grid-cols-2 gap-2">
          <NumberField
            key={`${node.id}-x`}
            label="X"
            value={Math.round(Emu.toPixels(node.bounds.x))}
            onCommit={(x) => commit('x', Emu.fromPixels(x))}
          />
          <NumberField
            key={`${node.id}-y`}
            label="Y"
            value={Math.round(Emu.toPixels(node.bounds.y))}
            onCommit={(y) => commit('y', Emu.fromPixels(y))}
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
            value={Math.round(Emu.toPixels(node.bounds.w))}
            onCommit={(w) => commit('w', Emu.fromPixels(w))}
          />
          <NumberField
            key={`${node.id}-h`}
            label="H"
            min={1}
            value={Math.round(Emu.toPixels(node.bounds.h))}
            onCommit={(h) => commit('h', Emu.fromPixels(h))}
          />
        </FieldGroup>
      </FieldSet>
    </FieldGroup>
  );
}
