import { createContext, type ReactElement, type ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';

type Theme = 'light' | 'dark' | 'system';

/**
 * The theme state and operations provided by the ThemeProvider.
 */
interface ThemeContextValue {
  /**
   * The stored preference, which may defer to the OS.
   */
  readonly theme: Theme;

  /**
   * The theme in effect once the system preference is resolved.
   */
  readonly resolvedTheme: 'light' | 'dark';

  /**
   * Persists the preference and applies it.
   */
  readonly setTheme: (theme: Theme) => void;
}

/**
 * Props for the ThemeProvider component.
 */
interface ThemeProviderProps {
  /**
   * The subtree that may call useTheme.
   */
  readonly children: ReactNode;

  /**
   * The localStorage key persisting the preference.
   */
  readonly storageKey: string;

  /**
   * The default theme used when no valid preference is stored.
   * @default 'system'
   */
  readonly defaultTheme?: Theme;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Parses a stored theme string into a Theme type, throwing an error for unknown values.
 *
 * @param stored - The stored theme string.
 * @returns The parsed Theme.
 * @throws TypeError if the stored value is not a valid Theme.
 */
function parseTheme(stored: string): Theme {
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  throw new TypeError(`Unknown theme: ${stored}`);
}

const THEME_STORAGE_OPTIONS = {
  serialize: (theme: Theme): string => theme,
  deserialize: parseTheme,
};

const DARK_QUERY = '(prefers-color-scheme: dark)';

/**
 * Provides the theme context to its subtree, persisting the preference in
 * localStorage and applying it to the document root.
 *
 * @param props - The props for the ThemeProvider component.
 * @returns The theme context provider.
 */
export function ThemeProvider({ children, storageKey, defaultTheme = 'system' }: ThemeProviderProps): ReactElement {
  const { value: theme, setValue: setTheme } = useLocalStorage<Theme>(storageKey, defaultTheme, THEME_STORAGE_OPTIONS);
  const [systemDark, setSystemDark] = useState(() => window.matchMedia(DARK_QUERY).matches);
  const resolvedTheme = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;

  useEffect(() => {
    const mediaQuery = window.matchMedia(DARK_QUERY);
    function handleChange(event: MediaQueryListEvent): void {
      setSystemDark(event.matches);
    }

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
  }, [resolvedTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Reads the theme context.
 *
 * @returns The current theme, its resolved value, and the setter.
 * @throws Error when called outside a ThemeProvider.
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === null) {
    throw new Error('useTheme must be called within a ThemeProvider.');
  }
  return context;
}
