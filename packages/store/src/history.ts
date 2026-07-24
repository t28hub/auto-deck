import type { Deck } from '@auto-deck/schema';
import { applyPatches, type Patch } from 'immer';

/**
 * One undoable step: a human-readable label plus the patches that redo it
 * (forward) and undo it (inverse).
 */
export interface HistoryEntry {
  /**
   * A human-readable name for the step, shown next to undo/redo.
   */
  readonly label: string;

  /**
   * Groups consecutive same-key steps into one entry, or null to never merge.
   * A run of keystrokes or a drag shares a key so it undoes as a single step.
   */
  readonly coalesceKey: string | null;

  /**
   * The patches that redo the step.
   */
  readonly forward: readonly Patch[];

  /**
   * The patches that undo the step.
   */
  readonly inverse: readonly Patch[];
}

/**
 * A bounded undo/redo stack. Entries before {@link History.index} are undoable
 * and entries from it onward are redoable, so recording after an undo discards
 * the redo tail.
 */
export interface History {
  /**
   * Every step in chronological order.
   */
  readonly entries: readonly HistoryEntry[];

  /**
   * How many entries are currently applied; the boundary between undo and redo.
   */
  readonly index: number;

  /**
   * The most steps to keep; older steps drop off the front once exceeded.
   */
  readonly limit: number;
}

/**
 * Creates an empty history that keeps at most `limit` steps.
 *
 * @param limit - The most steps to keep.
 * @returns The empty history.
 */
export function createHistory(limit: number): History {
  return { entries: [], index: 0, limit };
}

/**
 * Whether there is a step to undo.
 *
 * @param history - The history to inspect.
 * @returns Whether an undo is possible.
 */
export function canUndo(history: History): boolean {
  return history.index > 0;
}

/**
 * Whether there is a step to redo.
 *
 * @param history - The history to inspect.
 * @returns Whether a redo is possible.
 */
export function canRedo(history: History): boolean {
  return history.index < history.entries.length;
}

/**
 * The label of the step an undo would revert.
 *
 * @param history - The history to inspect.
 * @returns The label, or null when there is nothing to undo.
 */
export function undoLabel(history: History): string | null {
  return history.entries[history.index - 1]?.label ?? null;
}

/**
 * The label of the step a redo would reapply.
 *
 * @param history - The history to inspect.
 * @returns The label, or null when there is nothing to redo.
 */
export function redoLabel(history: History): string | null {
  return history.entries[history.index]?.label ?? null;
}

/**
 * Records a step, discarding any redo tail and enforcing the size limit. When
 * the step shares a coalesce key with the current top step and no redo tail
 * exists, it merges into that step instead of adding a new one.
 *
 * @param history - The history to record into.
 * @param entry - The step to record.
 * @returns The updated history.
 */
export function record(history: History, entry: HistoryEntry): History {
  const undoable = history.entries.slice(0, history.index);
  const top = undoable.at(-1);
  if (
    entry.coalesceKey !== null &&
    history.index === history.entries.length &&
    top !== undefined &&
    top.coalesceKey === entry.coalesceKey
  ) {
    const merged: HistoryEntry = {
      label: top.label,
      coalesceKey: top.coalesceKey,
      forward: [...top.forward, ...entry.forward],
      inverse: [...entry.inverse, ...top.inverse],
    };
    const entries = [...undoable.slice(0, -1), merged];
    return { ...history, entries, index: entries.length };
  }

  const appended = [...undoable, entry];
  const overflow = Math.max(0, appended.length - history.limit);
  const entries = appended.slice(overflow);
  return { ...history, entries, index: entries.length };
}

/**
 * Undoes the current step, applying its inverse patches to the deck.
 *
 * @param history - The history to move back.
 * @param deck - The deck to revert.
 * @returns The moved-back history and reverted deck, unchanged when no undo is possible.
 */
export function undo(history: History, deck: Deck): { history: History; deck: Deck } {
  const entry = history.entries[history.index - 1];
  if (!canUndo(history) || entry === undefined) {
    return { history, deck };
  }
  return { history: { ...history, index: history.index - 1 }, deck: applyPatches(deck, [...entry.inverse]) };
}

/**
 * Redoes the next step, applying its forward patches to the deck.
 *
 * @param history - The history to move forward.
 * @param deck - The deck to reapply to.
 * @returns The moved-forward history and reapplied deck, unchanged when no redo is possible.
 */
export function redo(history: History, deck: Deck): { history: History; deck: Deck } {
  const entry = history.entries[history.index];
  if (!canRedo(history) || entry === undefined) {
    return { history, deck };
  }
  return { history: { ...history, index: history.index + 1 }, deck: applyPatches(deck, [...entry.forward]) };
}
