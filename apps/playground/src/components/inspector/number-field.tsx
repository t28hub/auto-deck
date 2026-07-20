import { Field, FieldLabel } from '@auto-deck/ui/components/field';
import { Input } from '@auto-deck/ui/components/input';
import { type ReactElement, useId, useState } from 'react';

/**
 * Props for the NumberField component.
 */
interface NumberFieldProps {
  /**
   * The field name shown as its label.
   */
  readonly label: string;

  /**
   * The smallest committable value, for fields the deck requires positive.
   */
  readonly min?: number;

  /**
   * The largest committable value, for fields the deck requires finite.
   */
  readonly max?: number;

  /**
   * The current value.
   */
  readonly value: number;

  /**
   * Called with the new value on every committable change.
   */
  readonly onCommit: (value: number) => void;
}

/**
 * A labeled number field that commits changes on every committable change.
 *
 * @param props - The props for the NumberField component.
 * @returns The labeled number field.
 */
export function NumberField({
  label,
  // `Number.MIN_VALUE` is the smallest positive number, not the most negative number.
  min = -Number.MAX_VALUE,
  max = Number.MAX_VALUE,
  value,
  onCommit,
}: NumberFieldProps): ReactElement {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);

  return (
    <Field orientation="horizontal">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        type="number"
        max={max}
        min={min}
        value={draft ?? String(value)}
        onChange={(event) => {
          setDraft(event.target.value);

          const parsed = event.target.valueAsNumber;
          if (parsed >= min && parsed <= max) {
            onCommit(parsed);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === 'Escape') {
            event.currentTarget.blur();
          }
        }}
        onBlur={() => setDraft(null)}
      />
    </Field>
  );
}
