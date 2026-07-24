import type { DeckStore } from '@auto-deck/store';
import { useEffect } from 'react';

/**
 * Binds the undo/redo keyboard shortcuts — ⌘Z/Ctrl+Z and ⌘⇧Z/Ctrl+⇧Z — to the
 * editing session. Keystrokes inside text fields are left to the browser's own
 * text-editing undo.
 *
 * @param store - The editing session, or null until a deck is loaded.
 */
export function useUndoShortcuts(store: DeckStore | null): void {
  useEffect(() => {
    if (store === null) {
      return;
    }

    // Rebound as a const because the narrowing above does not reach the
    // nested handler.
    const session = store;

    function handleKeyDown(event: KeyboardEvent): void {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'z') {
        return;
      }

      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return;
      }

      event.preventDefault();
      if (event.shiftKey) {
        session.redo();
      } else {
        session.undo();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [store]);
}
