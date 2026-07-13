import type { Deck, SlideId } from '@auto-deck/schema';
import { create } from 'zustand';

interface DocumentState {
  /**
   * The deck being edited, or null until one is loaded from the repository.
   */
  readonly deck: Deck | null;

  /**
   * The slide the user is focused on, or null before the first selection.
   * May point at a slide the deck no longer contains; views simply find no
   * match then.
   */
  readonly selectedSlideId: SlideId | null;

  /**
   * Makes a deck loaded from the repository the document, dropping the
   * selection because it belonged to the previous deck.
   */
  readonly hydrate: (deck: Deck) => void;

  /**
   * Marks the slide as the current selection.
   */
  readonly selectSlide: (slideId: SlideId) => void;
}

/**
 * Reads the document store, subscribing to the slice picked by the selector.
 */
export const useDocumentStore = create<DocumentState>()((set) => ({
  deck: null,
  selectedSlideId: null,
  hydrate: (deck) => set({ deck, selectedSlideId: null }),
  selectSlide: (slideId) => set({ selectedSlideId: slideId }),
}));
