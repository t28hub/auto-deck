import type { Deck } from '@auto-deck/schema';
import { applyPatches, type Patch } from 'immer';
import type { Command } from './command';
import { canRedo, canUndo, createHistory, type History, record, redo, redoLabel, undo, undoLabel } from './history';
import { applyMiddleware, type Dispatch, type Middleware, type MiddlewareApi } from './middleware';
import { applyCommand } from './reducer';

/**
 * The default number of undoable steps a store keeps.
 */
const DEFAULT_LIMIT = 100;

/**
 * Options for {@link createDeckStore}.
 */
export interface DeckStoreOptions {
  /**
   * The most undoable steps to keep. Defaults to {@link DEFAULT_LIMIT}.
   */
  readonly limit?: number;

  /**
   * The middleware chain wrapping command dispatch, outermost first.
   */
  readonly middleware?: readonly Middleware[];
}

/**
 * A live editing session over a deck: the single source of truth that both the
 * UI and an AI agent change by dispatching serializable commands, with bounded
 * undo/redo and subscription. Framework-agnostic — a view layer subscribes to
 * it rather than owning the deck.
 */
export interface DeckStore {
  /**
   * Returns the current deck.
   */
  getDeck(): Deck;

  /**
   * Applies a change request, recording it in history unless told otherwise.
   */
  dispatch: Dispatch;

  /**
   * Opens an interaction so the commands dispatched until the next
   * {@link DeckStore.commitInteraction} collapse into one undoable step. Used
   * for gestures such as a drag that stream many commands. Idempotent while one
   * is already open.
   */
  beginInteraction(): void;

  /**
   * Closes the open interaction, recording the commands dispatched during it as
   * a single undoable step. A no-op when none is open or none changed the deck.
   *
   * @param label - The name for the step; defaults to the first command's label.
   */
  commitInteraction(label?: string): void;

  /**
   * Abandons the open interaction, reverting the deck to its pre-interaction
   * state without recording history. A no-op when none is open.
   */
  cancelInteraction(): void;

  /**
   * Undoes the most recent step. A no-op mid-interaction or with nothing to undo.
   */
  undo(): void;

  /**
   * Redoes the next step. A no-op mid-interaction or with nothing to redo.
   */
  redo(): void;

  /**
   * Whether there is a step to undo.
   */
  canUndo(): boolean;

  /**
   * Whether there is a step to redo.
   */
  canRedo(): boolean;

  /**
   * The label of the step an undo would revert, or null when there is none.
   */
  undoLabel(): string | null;

  /**
   * The label of the step a redo would reapply, or null when there is none.
   */
  redoLabel(): string | null;

  /**
   * Subscribes to deck and history changes.
   *
   * @param listener - Called after every change.
   * @returns A function that removes the subscription.
   */
  subscribe(listener: () => void): () => void;
}

/**
 * The patches accumulated by the commands dispatched during an open interaction.
 * Forward patches are kept flat in dispatch order; each command's inverse is
 * kept as its own segment so accumulation stays linear over a long gesture
 * (appending, never re-copying the growing whole). The segments are flattened
 * in reverse at commit or cancel, since undoing runs the commands back to front.
 */
interface Interaction {
  label: string | null;
  forward: Patch[];
  inverse: (readonly Patch[])[];
}

/**
 * Flattens per-command inverse segments into the patches that undo them all,
 * running the commands back to front.
 *
 * @param segments - Each command's inverse patches, in dispatch order.
 * @returns The combined inverse patches.
 */
function flattenInverse(segments: readonly (readonly Patch[])[]): Patch[] {
  return segments.reduceRight<Patch[]>((all, segment) => {
    all.push(...segment);
    return all;
  }, []);
}

/**
 * Creates a store holding the deck as the single source of truth.
 *
 * @param initialDeck - The deck to start from.
 * @param options - Optional history limit and middleware.
 * @returns The store.
 */
export function createDeckStore(initialDeck: Deck, options: DeckStoreOptions = {}): DeckStore {
  let deck = initialDeck;
  let history = createHistory(options.limit ?? DEFAULT_LIMIT);
  let interaction: Interaction | null = null;
  const listeners = new Set<() => void>();

  function notify(): void {
    for (const listener of listeners) {
      listener();
    }
  }

  /**
   * Moves the deck one step through history, unless an interaction is open or
   * the move is a no-op.
   *
   * @param move - Undoes or redoes against the current history and deck.
   */
  function step(move: (history: History, deck: Deck) => { history: History; deck: Deck }): void {
    if (interaction !== null) {
      return;
    }
    const result = move(history, deck);
    if (result.history === history) {
      return;
    }
    history = result.history;
    deck = result.deck;
    notify();
  }

  const baseDispatch: Dispatch = (command, dispatchOptions) => {
    const result = applyCommand(deck, command);
    if (result.forward.length === 0) {
      return;
    }
    deck = result.deck;

    if (dispatchOptions?.history === 'ignore') {
      notify();
      return;
    }

    if (interaction !== null) {
      interaction.forward.push(...result.forward);
      interaction.inverse.push(result.inverse);
      interaction.label ??= dispatchOptions?.label ?? labelFor(command);
      notify();
      return;
    }

    history = record(history, {
      label: dispatchOptions?.label ?? labelFor(command),
      coalesceKey: dispatchOptions?.coalesceKey ?? null,
      forward: result.forward,
      inverse: result.inverse,
    });
    notify();
  };

  const api: MiddlewareApi = { getDeck: () => deck };
  const dispatch = applyMiddleware(api, options.middleware ?? [], baseDispatch);

  return {
    getDeck: () => deck,
    dispatch,

    beginInteraction() {
      interaction ??= { label: null, forward: [], inverse: [] };
    },

    commitInteraction(label) {
      const pending = interaction;
      interaction = null;
      if (pending === null || pending.forward.length === 0) {
        return;
      }
      history = record(history, {
        label: label ?? pending.label ?? 'Edit',
        coalesceKey: null,
        forward: pending.forward,
        inverse: flattenInverse(pending.inverse),
      });
      notify();
    },

    cancelInteraction() {
      const pending = interaction;
      interaction = null;
      if (pending === null || pending.forward.length === 0) {
        return;
      }
      deck = applyPatches(deck, flattenInverse(pending.inverse));
      notify();
    },

    undo: () => step(undo),
    redo: () => step(redo),

    canUndo: () => canUndo(history),
    canRedo: () => canRedo(history),
    undoLabel: () => undoLabel(history),
    redoLabel: () => redoLabel(history),

    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/**
 * Returns a human-readable label for a command, shown next to undo/redo.
 *
 * @param command - The command to label.
 * @returns The label.
 */
function labelFor(command: Command): string {
  switch (command.type) {
    case 'setElementBounds':
      return 'Move element';
    case 'setElementText':
      return 'Edit text';
    case 'addElement':
      return 'Add element';
    case 'removeElement':
      return 'Remove element';
    case 'addSlide':
      return 'Add slide';
    case 'removeSlide':
      return 'Remove slide';
  }
}
