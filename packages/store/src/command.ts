import type { Element, ElementId, Rect, Slide, SlideId } from '@auto-deck/schema';

/**
 * Gives an element new bounds. A no-op when the element already has these bounds.
 */
export interface SetElementBoundsCommand {
  readonly type: 'setElementBounds';
  readonly slideId: SlideId;
  readonly elementId: ElementId;
  readonly bounds: Rect;
}

/**
 * Gives a text element new text. A no-op when the element is not a text element
 * or already holds this text.
 */
export interface SetElementTextCommand {
  readonly type: 'setElementText';
  readonly slideId: SlideId;
  readonly elementId: ElementId;
  readonly text: string;
}

/**
 * Inserts an element into a slide at the given index, or appends it when the
 * index is omitted.
 */
export interface AddElementCommand {
  readonly type: 'addElement';
  readonly slideId: SlideId;
  readonly element: Element;
  readonly index?: number;
}

/**
 * Removes an element from a slide. A no-op when the slide holds no such element.
 */
export interface RemoveElementCommand {
  readonly type: 'removeElement';
  readonly slideId: SlideId;
  readonly elementId: ElementId;
}

/**
 * Inserts a slide into the deck at the given index, or appends it when the
 * index is omitted.
 */
export interface AddSlideCommand {
  readonly type: 'addSlide';
  readonly slide: Slide;
  readonly index?: number;
}

/**
 * Removes a slide from the deck. A no-op when the deck holds no such slide.
 */
export interface RemoveSlideCommand {
  readonly type: 'removeSlide';
  readonly slideId: SlideId;
}

/**
 * A change request against a deck: the single, serializable unit that both the
 * UI and an AI agent produce, that the store applies, and that undo/redo
 * replays. New request kinds join this union.
 */
export type Command =
  | SetElementBoundsCommand
  | SetElementTextCommand
  | AddElementCommand
  | RemoveElementCommand
  | AddSlideCommand
  | RemoveSlideCommand;
