import {
  canvasId,
  type Deck,
  deckId,
  type Element,
  Emu,
  elementId,
  layoutIdSchema,
  rect,
  type Slide,
  size,
  slideId,
} from '@auto-deck/schema';
import { describe, expect, it } from 'vitest';
import { useDocumentStore } from './document';

/**
 * Builds a single-slide, single-element deck plus the parts the tests target.
 */
function sampleDeck(): { deck: Deck; slide: Slide; element: Element } {
  const element: Element = {
    id: elementId(),
    type: 'text',
    text: 'hello',
    bounds: rect(Emu.of(0), Emu.of(0), Emu.of(100), Emu.of(50)),
  };
  const slide: Slide = { id: slideId(), layoutId: layoutIdSchema.parse('layout-basic'), elements: [element] };
  const deck: Deck = {
    id: deckId(),
    canvas: { id: canvasId(), displayName: 'Test', size: size(Emu.of(9600), Emu.of(5400)) },
    layouts: [],
    slides: [slide],
  };
  return { deck, slide, element };
}

describe('useDocumentStore', () => {
  it('should open a session over the hydrated deck and clear the selection', () => {
    // Arrange
    const { deck, slide } = sampleDeck();
    useDocumentStore.getState().selectSlide(slide.id);

    // Act
    useDocumentStore.getState().hydrate(deck);

    // Assert
    const state = useDocumentStore.getState();
    expect(state.store?.getDeck()).toBe(deck);
    expect(state.selectedSlideId).toBeNull();
    expect(state.selectedElementId).toBeNull();
  });

  it('should round-trip a dispatched change through undo and redo', () => {
    // Arrange
    const { deck, slide, element } = sampleDeck();
    useDocumentStore.getState().hydrate(deck);
    const store = useDocumentStore.getState().store;
    if (store === null) {
      throw new Error('expected the session to be open');
    }

    // Act
    store.dispatch({ type: 'setElementText', slideId: slide.id, elementId: element.id, text: 'edited' });

    // Assert
    expect(store.getDeck().slides[0]?.elements[0]).toMatchObject({ text: 'edited' });
    expect(store.canUndo()).toBe(true);

    // Act
    store.undo();

    // Assert
    expect(store.getDeck()).toEqual(deck);

    // Act
    store.redo();

    // Assert
    expect(store.getDeck().slides[0]?.elements[0]).toMatchObject({ text: 'edited' });
  });

  it('should discard the previous history when a deck is hydrated again', () => {
    // Arrange
    const { deck, slide, element } = sampleDeck();
    useDocumentStore.getState().hydrate(deck);
    useDocumentStore
      .getState()
      .store?.dispatch({ type: 'setElementText', slideId: slide.id, elementId: element.id, text: 'edited' });

    // Act
    useDocumentStore.getState().hydrate(deck);

    // Assert
    expect(useDocumentStore.getState().store?.canUndo()).toBe(false);
  });

  it('should keep selection changes out of the undo history', () => {
    // Arrange
    const { deck, slide, element } = sampleDeck();
    useDocumentStore.getState().hydrate(deck);

    // Act
    useDocumentStore.getState().selectSlide(slide.id);
    useDocumentStore.getState().selectElement(element.id);

    // Assert
    const state = useDocumentStore.getState();
    expect(state.selectedSlideId).toBe(slide.id);
    expect(state.selectedElementId).toBe(element.id);
    expect(state.store?.canUndo()).toBe(false);
  });
});
