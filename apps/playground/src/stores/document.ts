import type { Deck, ElementId, SlideId } from '@auto-deck/schema';
import { createDeckStore, type DeckStore } from '@auto-deck/store';
import { useSyncExternalStore } from 'react';
import { create } from 'zustand';

interface DocumentState {
  /**
   * The editing session over the loaded deck, or null until one is loaded
   * from the repository. The deck itself lives in the session — read it with
   * {@link useDeck} rather than caching it here.
   */
  readonly store: DeckStore | null;

  /**
   * The identifier of the slide highlighted as selected, or null when none is selected.
   */
  readonly selectedSlideId: SlideId | null;

  /**
   * The identifier of the element highlighted as selected, or null when none is selected.
   */
  readonly selectedElementId: ElementId | null;

  /**
   * Opens a fresh editing session over the deck, clearing any selection and
   * discarding the previous session's history.
   */
  readonly hydrate: (deck: Deck) => void;

  /**
   * Marks the slide as the current selection, or clears it with null.
   */
  readonly selectSlide: (slideId: SlideId) => void;

  /**
   * Marks the element as the current selection, or clears it with null.
   */
  readonly selectElement: (elementId: ElementId | null) => void;
}

/**
 * Reads the document store, subscribing to the slice picked by the selector.
 * The store holds the editing session and the selection; deck changes are
 * observed through {@link useDeck} and {@link useHistory}.
 */
export const useDocumentStore = create<DocumentState>()((set) => ({
  store: null,
  selectedSlideId: null,
  selectedElementId: null,
  hydrate: (deck) => set({ store: createDeckStore(deck), selectedSlideId: null, selectedElementId: null }),
  selectSlide: (slideId) => set({ selectedSlideId: slideId, selectedElementId: null }),
  selectElement: (elementId) => set({ selectedElementId: elementId }),
}));

/**
 * Subscribes to nothing, for the states before a deck is loaded.
 *
 * @returns A function that removes the subscription.
 */
function subscribeToNothing(): () => void {
  return () => {};
}

/**
 * Reads one value from the editing session, re-rendering when it changes.
 *
 * @param store - The editing session, or null until a deck is loaded.
 * @param read - Reads the value from the session.
 * @param fallback - The value while no session is open.
 * @returns The read value, or the fallback while no session is open.
 */
function useStoreValue<T>(store: DeckStore | null, read: (deckStore: DeckStore) => T, fallback: T): T {
  return useSyncExternalStore(store === null ? subscribeToNothing : store.subscribe, () =>
    store === null ? fallback : read(store),
  );
}

/**
 * Reads the editing session, for dispatching commands and controlling history.
 * Subscribe to the values inside it with {@link useDeck} and {@link useHistory}
 * instead of reading them from the session directly.
 *
 * @returns The editing session, or null until a deck is loaded.
 */
export function useDeckStore(): DeckStore | null {
  return useDocumentStore((state) => state.store);
}

/**
 * Reads the deck being edited, re-rendering on every change to it.
 *
 * @returns The deck, or null until one is loaded.
 */
export function useDeck(): Deck | null {
  const store = useDeckStore();
  return useStoreValue<Deck | null>(store, (deckStore) => deckStore.getDeck(), null);
}

/**
 * What the undo/redo controls show for the current history.
 */
export interface HistoryView {
  /**
   * Whether there is a step to undo.
   */
  readonly canUndo: boolean;

  /**
   * Whether there is a step to redo.
   */
  readonly canRedo: boolean;

  /**
   * The label of the step an undo would revert, or null when there is none.
   */
  readonly undoLabel: string | null;

  /**
   * The label of the step a redo would reapply, or null when there is none.
   */
  readonly redoLabel: string | null;
}

/**
 * Reads the undo/redo availability and labels, re-rendering on every change.
 *
 * @returns The current history view.
 */
export function useHistory(): HistoryView {
  const store = useDeckStore();
  const canUndo = useStoreValue(store, (deckStore) => deckStore.canUndo(), false);
  const canRedo = useStoreValue(store, (deckStore) => deckStore.canRedo(), false);
  const undoLabel = useStoreValue<string | null>(store, (deckStore) => deckStore.undoLabel(), null);
  const redoLabel = useStoreValue<string | null>(store, (deckStore) => deckStore.redoLabel(), null);
  return { canUndo, canRedo, undoLabel, redoLabel };
}
