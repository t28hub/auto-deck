import { type Deck, type Element, type ElementId, type Rect, rectEquals, type SlideId } from '@auto-deck/schema';
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

  /**
   * Gives the text element new text.
   */
  readonly setElementText: (slideId: SlideId, elementId: ElementId, text: string) => void;
}

/**
 * Returns the deck with one element replaced by its patched form.
 * Returns null when the element is missing or the patch declines the update.
 *
 * @param deck - The deck holding the element, or null when none is loaded.
 * @param slideId - The slide holding the element.
 * @param elementId - The element to patch.
 * @param patch - Maps the element to its replacement, or to undefined to decline the update.
 * @returns The updated deck, or null when there is nothing to update.
 */
function patchElement(
  deck: Deck | null,
  slideId: SlideId,
  elementId: ElementId,
  patch: (element: Element) => Element | undefined,
): Deck | null {
  if (deck === null) {
    return null;
  }

  const targetSlide = deck.slides.find((slide) => slide.id === slideId);
  const targetElement = targetSlide?.elements.find((element) => element.id === elementId);
  if (targetElement === undefined) {
    return null;
  }

  const patched = patch(targetElement);
  if (patched === undefined) {
    return null;
  }

  return {
    ...deck,
    slides: deck.slides.map((slide) => {
      if (slide.id !== slideId) {
        return slide;
      }

      const elements = slide.elements.map((element) => (element.id === elementId ? patched : element));
      return { ...slide, elements };
    }),
  };
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
      const deck = patchElement(state.deck, slideId, elementId, (element) => {
        if (element.bounds !== undefined && rectEquals(element.bounds, bounds)) {
          return undefined;
        }
        return { ...element, bounds };
      });
      return deck === null ? {} : { deck };
    }),
  setElementText: (slideId, elementId, text) =>
    set((state) => {
      const deck = patchElement(state.deck, slideId, elementId, (element) => {
        if (element.type !== 'text' || element.text === text) {
          return undefined;
        }
        return { ...element, text };
      });
      return deck === null ? {} : { deck };
    }),
}));
