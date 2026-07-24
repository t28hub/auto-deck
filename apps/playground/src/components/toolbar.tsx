import { Button } from '@auto-deck/ui/components/button';
import { useTheme } from '@auto-deck/ui/components/theme-provider';
import { cn } from '@auto-deck/ui/lib/utils';
import { Moon, PanelLeft, Redo2, Sun, Undo2 } from 'lucide-react';
import type { ReactElement } from 'react';
import { useDeckStore, useHistory } from '@/stores/document';

/**
 * Props for the Toolbar component.
 */
interface ToolbarProps {
  /**
   * Extra classes merged onto the host element.
   */
  readonly className?: string;

  /**
   * Whether the navigator column is open.
   */
  readonly navigatorOpen: boolean;

  /**
   * Called when the navigator toggle button is pressed.
   */
  readonly onToggleNavigator: () => void;
}

/**
 * The toolbar with buttons for toggling the navigator, undoing and redoing, and switching the theme.
 *
 * @param props - The props for the Toolbar component.
 * @returns The toolbar region.
 */
export function Toolbar({ navigatorOpen, onToggleNavigator, className }: ToolbarProps): ReactElement {
  const { resolvedTheme, setTheme } = useTheme();
  const store = useDeckStore();
  const { canUndo, canRedo, undoLabel, redoLabel } = useHistory();

  return (
    <header className={cn('flex h-10 items-center justify-between gap-3.5 border-b border-border px-3.5', className)}>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleNavigator}
          aria-expanded={navigatorOpen}
          aria-label="Toggle navigator"
        >
          <PanelLeft className="stroke-1" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          disabled={!canUndo}
          onClick={() => store?.undo()}
          title={undoLabel === null ? 'Undo' : `Undo ${undoLabel}`}
          aria-label="Undo"
        >
          <Undo2 className="stroke-1" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          disabled={!canRedo}
          onClick={() => store?.redo()}
          title={redoLabel === null ? 'Redo' : `Redo ${redoLabel}`}
          aria-label="Redo"
        >
          <Redo2 className="stroke-1" />
        </Button>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        aria-label="Toggle theme"
      >
        {resolvedTheme === 'dark' ? <Sun className="stroke-1" /> : <Moon className="stroke-1" />}
      </Button>
    </header>
  );
}
