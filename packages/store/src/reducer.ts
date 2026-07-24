import { type Deck, type Element, type ElementId, rectEquals, type Slide, type SlideId } from '@auto-deck/schema';
import { castDraft, type Draft, enablePatches, type Patch, produceWithPatches } from 'immer';
import type { Command } from './command';

// Immer only emits patches once patch support is enabled; do it once at load.
enablePatches();

/**
 * The result of applying a command: the next deck plus the patches that turn
 * the previous deck into it (forward) and back (inverse).
 */
export interface CommandResult {
  /**
   * The deck after the command, or the same deck when the command changed nothing.
   */
  readonly deck: Deck;

  /**
   * The patches turning the previous deck into the next one. Empty when the
   * command was a no-op.
   */
  readonly forward: readonly Patch[];

  /**
   * The patches turning the next deck back into the previous one.
   */
  readonly inverse: readonly Patch[];
}

/**
 * Applies a command to a deck as a pure function, deriving the forward and
 * inverse patches with Immer so callers never hand-write an undo.
 *
 * @param deck - The deck to change.
 * @param command - The change request to apply.
 * @returns The next deck and the patches that move between it and the previous deck.
 */
export function applyCommand(deck: Deck, command: Command): CommandResult {
  const [next, forward, inverse] = produceWithPatches(deck, (draft) => {
    mutate(draft, command);
  });
  return { deck: next, forward, inverse };
}

/**
 * Mutates the deck draft in place to carry out the command.
 *
 * @param draft - The deck draft to mutate.
 * @param command - The change request to carry out.
 */
function mutate(draft: Draft<Deck>, command: Command): void {
  switch (command.type) {
    case 'setElementBounds': {
      const element = findElement(draft, command.slideId, command.elementId);
      if (element !== undefined && (element.bounds === undefined || !rectEquals(element.bounds, command.bounds))) {
        element.bounds = castDraft(command.bounds);
      }
      return;
    }
    case 'setElementText': {
      const element = findElement(draft, command.slideId, command.elementId);
      if (element !== undefined && element.type === 'text' && element.text !== command.text) {
        element.text = command.text;
      }
      return;
    }
    case 'addElement': {
      const slide = findSlide(draft, command.slideId);
      if (slide !== undefined) {
        slide.elements.splice(command.index ?? slide.elements.length, 0, castDraft(command.element));
      }
      return;
    }
    case 'removeElement': {
      const slide = findSlide(draft, command.slideId);
      const index = slide?.elements.findIndex((candidate) => candidate.id === command.elementId) ?? -1;
      if (slide !== undefined && index !== -1) {
        slide.elements.splice(index, 1);
      }
      return;
    }
    case 'addSlide': {
      draft.slides.splice(command.index ?? draft.slides.length, 0, castDraft(command.slide));
      return;
    }
    case 'removeSlide': {
      const index = draft.slides.findIndex((candidate) => candidate.id === command.slideId);
      if (index !== -1) {
        draft.slides.splice(index, 1);
      }
      return;
    }
    default:
      assertNever(command);
  }
}

/**
 * Asserts a command union is exhausted: fails to compile when a new command
 * variant is left unhandled above, and throws if one reaches here at runtime.
 *
 * @param command - The command no case handled.
 * @returns Never.
 * @throws {Error} Always.
 */
function assertNever(command: never): never {
  throw new Error(`unhandled command: ${JSON.stringify(command)}`);
}

/**
 * Finds an element within a slide of the deck draft.
 *
 * @param draft - The deck draft to search.
 * @param slideId - The slide holding the element.
 * @param elementId - The element to find.
 * @returns The element draft, or undefined when the slide or element is missing.
 */
function findElement(draft: Draft<Deck>, slideId: SlideId, elementId: ElementId): Draft<Element> | undefined {
  return findSlide(draft, slideId)?.elements.find((candidate) => candidate.id === elementId);
}

/**
 * Finds a slide of the deck draft.
 *
 * @param draft - The deck draft to search.
 * @param slideId - The slide to find.
 * @returns The slide draft, or undefined when the slide is missing.
 */
function findSlide(draft: Draft<Deck>, slideId: SlideId): Draft<Slide> | undefined {
  return draft.slides.find((candidate) => candidate.id === slideId);
}
