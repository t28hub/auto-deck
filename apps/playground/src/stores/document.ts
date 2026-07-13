import type { SlideId } from '@auto-deck/schema';
import { create } from 'zustand';
import { SAMPLE_DECK } from '@/sample';

interface DocumentState {
  /**
   * The deck JSON text.
   */
  readonly source: string;

  /**
   * The slide the user is focused on, or null before the first selection.
   * May point at a slide the source no longer contains; views simply find no
   * match then.
   */
  readonly selectedSlideId: SlideId | null;

  /**
   * Replaces the deck JSON text.
   */
  readonly setSource: (source: string) => void;

  /**
   * Marks the slide as the current selection.
   */
  readonly selectSlide: (slideId: SlideId) => void;
}

/**
 * Reads the document store, subscribing to the slice picked by the selector.
 */
export const useDocumentStore = create<DocumentState>()((set) => ({
  source: SAMPLE_DECK,
  selectedSlideId: null,
  setSource: (source) => set({ source }),
  selectSlide: (slideId) => set({ selectedSlideId: slideId }),
}));
