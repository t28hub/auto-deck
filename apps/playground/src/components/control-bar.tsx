import { Maximize, Minus, Plus } from 'lucide-react';
import { memo, type ReactElement } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/**
 * Props for the ControlBar component.
 */
interface ControlBarProps {
  /**
   * Extra classes merged onto the host element.
   */
  readonly className?: string;

  /**
   * Called with the parsed zoom when a percentage is entered directly.
   */
  readonly onZoomChange: (zoom: number) => void;

  /**
   * Called when the zoom in button is pressed.
   */
  readonly onZoomIn: () => void;

  /**
   * Called when the zoom out button is pressed.
   */
  readonly onZoomOut: () => void;

  /**
   * Called when the zoom to fit button is pressed.
   */
  readonly onZoomToFit: () => void;

  /**
   * The current zoom, where 1 shows the slide at its natural pixel size.
   */
  readonly zoom: number;
}

/**
 * The floating bar hosting the editor controls, currently the zoom operations.
 * Memoized because the editor re-renders on every deck edit while the bar's
 * props only change on zoom actions.
 *
 * @param props - The props for the ControlBar component.
 * @returns The control bar.
 */
export const ControlBar = memo(function ControlBar({
  className,
  onZoomChange,
  onZoomIn,
  onZoomOut,
  onZoomToFit,
  zoom,
}: ControlBarProps): ReactElement {
  return (
    <div className={cn('flex items-center rounded-md border border-border bg-background shadow-sm p-0.5', className)}>
      <Button variant="ghost" size="icon" onClick={onZoomOut} aria-label="Zoom out">
        <Minus className="stroke-1" />
      </Button>

      <ZoomInput onZoomChange={onZoomChange} zoom={zoom} />

      <Button variant="ghost" size="icon" onClick={onZoomIn} aria-label="Zoom in">
        <Plus className="stroke-1" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onZoomToFit} aria-label="Zoom to fit">
        <Maximize className="stroke-1" />
      </Button>
    </div>
  );
});

/**
 * Props for the ZoomInput component.
 */
interface ZoomInputProps {
  /**
   * Called with the parsed zoom when a percentage is entered.
   */
  readonly onZoomChange: (zoom: number) => void;

  /**
   * The current zoom, where 1 shows the slide at its natural pixel size.
   */
  readonly zoom: number;
}

/**
 * The field showing the zoom as a percentage and committing values typed over
 * it. A value commits on Enter or blur, and Escape restores the display.
 *
 * @param props - The props for the ZoomInput component.
 * @returns The zoom percentage field.
 */
function ZoomInput({ onZoomChange, zoom }: ZoomInputProps): ReactElement {
  const percent = `${Math.round(zoom * 100)}%`;

  /**
   * Parses the entered percentage and commits it as the zoom. Text matching
   * the current display is skipped, so an untouched blur and the Escape reset
   * never re-commit the rounded percentage over the precise zoom.
   */
  function commitZoom(input: HTMLInputElement): void {
    if (input.value === percent) {
      return;
    }

    const entered = Number.parseFloat(input.value);
    if (!Number.isNaN(entered)) {
      onZoomChange(entered / 100);
    }
    input.value = percent;
  }

  // The key remounts the uncontrolled input when the zoom changes, so the
  // displayed percentage follows the buttons and the fit command.
  return (
    <Input
      key={zoom}
      type="text"
      inputMode="decimal"
      defaultValue={percent}
      aria-label="Zoom percentage"
      className="w-12 border-transparent bg-transparent px-1 text-center font-mono text-xs tabular-nums"
      onFocus={(event) => event.currentTarget.select()}
      onBlur={(event) => commitZoom(event.currentTarget)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.currentTarget.blur();
        }

        if (event.key === 'Escape') {
          event.currentTarget.value = percent;
          event.currentTarget.blur();
        }
      }}
    />
  );
}
