import { type Deck, type ElementId, type Rect, rectEquals, type SlideId } from '@auto-deck/schema';
import { create } from 'zustand';

interface DocumentState {
  /**
   * The deck being edited, or null until one is loaded from the repository.
   */
  readonly deck: Deck | null;

  /**
   * The identifier of the slide highlighted as selected, or null when none is selected.
   */
  readonly selectedSlideId: SlideId | null;

  /**
   * The identifier of the element highlighted as selected, or null when none is selected.
   */
  readonly selectedElementId: ElementId | null;

  /**
   * Replaces the deck in the store, clearing any selection.
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

  /**
   * Gives the element new bounds.
   */
  readonly moveElement: (slideId: SlideId, elementId: ElementId, bounds: Rect) => void;
}

/**
 * Reads the document store, subscribing to the slice picked by the selector.
 */
export const useDocumentStore = create<DocumentState>()((set) => ({
  deck: null,
  selectedSlideId: null,
  selectedElementId: null,
  hydrate: (deck) => set({ deck, selectedSlideId: null, selectedElementId: null }),
  selectSlide: (slideId) => set({ selectedSlideId: slideId, selectedElementId: null }),
  selectElement: (elementId) => set({ selectedElementId: elementId }),
  moveElement: (slideId, elementId, bounds) =>
    set((state) => {
      if (state.deck === null) {
        return {};
      }

      const targetSlide = state.deck.slides.find((slide) => slide.id === slideId);
      const targetElement = targetSlide?.elements.find((element) => element.id === elementId);
      if (!targetElement) {
        return {};
      }
      if (targetElement.bounds !== undefined && rectEquals(targetElement.bounds, bounds)) {
        return {};
      }

      return {
        deck: {
          ...state.deck,
          slides: state.deck.slides.map((slide) => {
            if (slide.id !== slideId) {
              return slide;
            }

            const elements = slide.elements.map((element) => {
              if (element.id !== elementId) {
                return element;
              }
              return { ...element, bounds };
            });
            return { ...slide, elements };
          }),
        },
      };
    }),
}));
