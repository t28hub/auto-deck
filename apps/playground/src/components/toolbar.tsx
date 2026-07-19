import { Button } from '@auto-deck/ui/components/button';
import { useTheme } from '@auto-deck/ui/components/theme-provider';
import { cn } from '@auto-deck/ui/lib/utils';
import { Moon, PanelLeft, Sun } from 'lucide-react';
import type { ReactElement } from 'react';

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
 * The toolbar with the navigator toggle and the theme toggle.
 *
 * @param props - The props for the Toolbar component.
 * @returns The toolbar region.
 */
export function Toolbar({ navigatorOpen, onToggleNavigator, className }: ToolbarProps): ReactElement {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <header className={cn('flex h-10 items-center justify-between gap-3.5 border-b border-border px-3.5', className)}>
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
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        aria-label="Toggle theme"
      >
        {resolvedTheme === 'dark' ? <Sun className="stroke-1" /> : <Moon className="stroke-1" />}
      </Button>
    </header>
  );
}
