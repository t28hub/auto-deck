import { type Deck, type ElementId, Emu, rect, type SlideId } from '@auto-deck/schema';
import { describe, expect, it, vi } from 'vitest';
import type { Command } from './command';
import { deckWith, onlyElement, onlyText, slideWith, textElement } from './fixture';
import type { Middleware } from './middleware';
import { createDeckStore } from './store';

/**
 * Builds a one-slide, one-element deck plus its slide and element ids.
 */
function scene(): { deck: Deck; slideId: SlideId; elementId: ElementId } {
  const element = textElement('hello', 0, 0, 100, 50);
  const slide = slideWith([element]);
  return { deck: deckWith([slide]), slideId: slide.id, elementId: element.id };
}

/**
 * Builds a command that moves the scene element to the given x.
 */
function move(slideId: SlideId, elementId: ElementId, x: number): Command {
  return { type: 'setElementBounds', slideId, elementId, bounds: rect(Emu.of(x), Emu.of(0), Emu.of(100), Emu.of(50)) };
}

describe('createDeckStore', () => {
  it('should apply a command, record it, and notify subscribers', () => {
    // Arrange
    const { deck, slideId, elementId } = scene();
    const store = createDeckStore(deck);
    const listener = vi.fn();
    store.subscribe(listener);

    // Act
    store.dispatch(move(slideId, elementId, 42));

    // Assert
    expect(onlyElement(store.getDeck()).bounds?.x).toBe(42);
    expect(store.canUndo()).toBe(true);
    expect(store.canRedo()).toBe(false);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('should round-trip a change through undo and redo', () => {
    // Arrange
    const { deck, slideId, elementId } = scene();
    const store = createDeckStore(deck);
    store.dispatch(move(slideId, elementId, 42));

    // Act
    store.undo();

    // Assert
    expect(onlyElement(store.getDeck()).bounds?.x).toBe(0);
    expect(store.canUndo()).toBe(false);
    expect(store.canRedo()).toBe(true);

    // Act
    store.redo();

    // Assert
    expect(onlyElement(store.getDeck()).bounds?.x).toBe(42);
  });

  it('should ignore a command that changes nothing', () => {
    // Arrange
    const { deck, slideId, elementId } = scene();
    const store = createDeckStore(deck);
    const listener = vi.fn();
    store.subscribe(listener);

    // Act
    store.dispatch(move(slideId, elementId, 0));

    // Assert
    expect(store.getDeck()).toBe(deck);
    expect(store.canUndo()).toBe(false);
    expect(listener).not.toHaveBeenCalled();
  });

  it('should collapse an interaction into a single undoable step', () => {
    // Arrange
    const { deck, slideId, elementId } = scene();
    const store = createDeckStore(deck);

    // Act
    store.beginInteraction();
    store.dispatch(move(slideId, elementId, 10));
    store.dispatch(move(slideId, elementId, 20));
    store.dispatch(move(slideId, elementId, 30));

    // Assert
    expect(onlyElement(store.getDeck()).bounds?.x).toBe(30);
    expect(store.canUndo()).toBe(false);

    // Act
    store.commitInteraction();

    // Assert
    expect(store.canUndo()).toBe(true);

    // Act
    store.undo();

    // Assert
    expect(onlyElement(store.getDeck()).bounds?.x).toBe(0);
    expect(store.canUndo()).toBe(false);
  });

  it('should revert and record nothing when an interaction is cancelled', () => {
    // Arrange
    const { deck, slideId, elementId } = scene();
    const store = createDeckStore(deck);

    // Act
    store.beginInteraction();
    store.dispatch(move(slideId, elementId, 10));
    store.dispatch(move(slideId, elementId, 20));
    store.cancelInteraction();

    // Assert
    expect(onlyElement(store.getDeck()).bounds?.x).toBe(0);
    expect(store.canUndo()).toBe(false);
  });

  it('should coalesce commands sharing a key into one undoable step', () => {
    // Arrange
    const { deck, slideId, elementId } = scene();
    const store = createDeckStore(deck);
    const coalesceKey = `text:${elementId}`;

    // Act
    store.dispatch({ type: 'setElementText', slideId, elementId, text: 'h' }, { coalesceKey });
    store.dispatch({ type: 'setElementText', slideId, elementId, text: 'hi' }, { coalesceKey });
    store.dispatch({ type: 'setElementText', slideId, elementId, text: 'hey' }, { coalesceKey });

    // Assert
    expect(onlyText(store.getDeck())).toBe('hey');

    // Act
    store.undo();

    // Assert
    expect(onlyText(store.getDeck())).toBe('hello');
    expect(store.canUndo()).toBe(false);
  });

  it('should keep at most the configured number of steps', () => {
    // Arrange
    const { deck, slideId, elementId } = scene();
    const store = createDeckStore(deck, { limit: 2 });

    // Act
    store.dispatch(move(slideId, elementId, 10));
    store.dispatch(move(slideId, elementId, 20));
    store.dispatch(move(slideId, elementId, 30));
    store.undo();
    store.undo();

    // Assert: the first step (0 to 10) fell off, so undo bottoms out at 10.
    expect(onlyElement(store.getDeck()).bounds?.x).toBe(10);
    expect(store.canUndo()).toBe(false);
  });

  it('should change the deck without recording when history is ignored', () => {
    // Arrange
    const { deck, slideId, elementId } = scene();
    const store = createDeckStore(deck);

    // Act
    store.dispatch(move(slideId, elementId, 42), { history: 'ignore' });

    // Assert
    expect(onlyElement(store.getDeck()).bounds?.x).toBe(42);
    expect(store.canUndo()).toBe(false);
  });

  it('should pass commands through middleware, which may drop them', () => {
    // Arrange
    const { deck, slideId, elementId } = scene();
    const seen: Command[] = [];
    const observe: Middleware = () => (next) => (command, options) => {
      seen.push(command);
      next(command, options);
    };
    const block: Middleware = () => () => () => {};

    // Act & Assert: an observing middleware sees the command and lets it through.
    const observed = createDeckStore(deck, { middleware: [observe] });
    observed.dispatch(move(slideId, elementId, 42));
    expect(seen).toHaveLength(1);
    expect(observed.canUndo()).toBe(true);

    // Act & Assert: a blocking middleware drops the command.
    const blocked = createDeckStore(deck, { middleware: [block] });
    blocked.dispatch(move(slideId, elementId, 42));
    expect(blocked.getDeck()).toBe(deck);
    expect(blocked.canUndo()).toBe(false);
  });

  it('should stop notifying after unsubscribe', () => {
    // Arrange
    const { deck, slideId, elementId } = scene();
    const store = createDeckStore(deck);
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    // Act
    unsubscribe();
    store.dispatch(move(slideId, elementId, 42));

    // Assert
    expect(listener).not.toHaveBeenCalled();
  });

  it('should add and remove elements through commands', () => {
    // Arrange
    const { deck, slideId } = scene();
    const store = createDeckStore(deck);
    const added = textElement('added');

    // Act
    store.dispatch({ type: 'addElement', slideId, element: added });

    // Assert
    expect(store.getDeck().slides[0]?.elements).toHaveLength(2);

    // Act
    store.undo();

    // Assert
    expect(store.getDeck().slides[0]?.elements).toHaveLength(1);

    // Act
    store.dispatch({ type: 'removeElement', slideId, elementId: onlyElement(store.getDeck()).id });

    // Assert
    expect(store.getDeck().slides[0]?.elements).toHaveLength(0);
  });

  it('should label steps, letting the caller override the default', () => {
    // Arrange
    const { deck, slideId, elementId } = scene();
    const store = createDeckStore(deck);
    expect(store.undoLabel()).toBeNull();

    // Act
    store.dispatch(move(slideId, elementId, 10));

    // Assert: the default label comes from the command type.
    expect(store.undoLabel()).toBe('Move element');

    // Act
    store.dispatch(move(slideId, elementId, 20), { label: 'Resize element' });

    // Assert: the caller-supplied label wins.
    expect(store.undoLabel()).toBe('Resize element');

    // Act
    store.undo();

    // Assert
    expect(store.redoLabel()).toBe('Resize element');
    expect(store.undoLabel()).toBe('Move element');
  });

  it('should label an interaction step from the commit', () => {
    // Arrange
    const { deck, slideId, elementId } = scene();
    const store = createDeckStore(deck);

    // Act
    store.beginInteraction();
    store.dispatch(move(slideId, elementId, 10));
    store.dispatch(move(slideId, elementId, 20));
    store.commitInteraction('Drag element');

    // Assert
    expect(store.undoLabel()).toBe('Drag element');
  });
});
