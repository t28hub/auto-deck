import type { Patch } from 'immer';
import { describe, expect, it } from 'vitest';
import { canRedo, canUndo, createHistory, type History, type HistoryEntry, record } from './history';

/**
 * Builds a history entry with one placeholder patch each way. Only the label
 * and coalesce key matter to the stack; the patch content does not.
 */
function entry(label: string, coalesceKey: string | null): HistoryEntry {
  const patch: Patch = { op: 'replace', path: ['v'], value: label };
  return { label, coalesceKey, forward: [patch], inverse: [patch] };
}

describe('createHistory', () => {
  it('should start empty with nothing to undo or redo', () => {
    // Act
    const history = createHistory(100);

    // Assert
    expect(history.entries).toHaveLength(0);
    expect(history.index).toBe(0);
    expect(canUndo(history)).toBe(false);
    expect(canRedo(history)).toBe(false);
  });
});

describe('record', () => {
  it('should append the entry and make it undoable', () => {
    // Act
    const history = record(createHistory(100), entry('a', null));

    // Assert
    expect(history.entries).toHaveLength(1);
    expect(history.index).toBe(1);
    expect(canUndo(history)).toBe(true);
    expect(canRedo(history)).toBe(false);
  });

  it('should discard the redo tail when recording after an undo', () => {
    // Arrange
    const undone: History = { entries: [entry('a', null), entry('b', null), entry('c', null)], index: 1, limit: 100 };

    // Act
    const history = record(undone, entry('d', null));

    // Assert
    expect(history.entries.map((current) => current.label)).toEqual(['a', 'd']);
    expect(history.index).toBe(2);
    expect(canRedo(history)).toBe(false);
  });

  it('should merge a step sharing the current coalesce key', () => {
    // Arrange
    const first = record(createHistory(100), entry('type', 'text:1'));

    // Act
    const merged = record(first, entry('type', 'text:1'));

    // Assert
    expect(merged.entries).toHaveLength(1);
    expect(merged.index).toBe(1);
    expect(merged.entries[0]?.forward).toHaveLength(2);
    expect(merged.entries[0]?.inverse).toHaveLength(2);
  });

  it('should not merge steps with different coalesce keys', () => {
    // Arrange
    const first = record(createHistory(100), entry('type', 'text:1'));

    // Act
    const history = record(first, entry('type', 'text:2'));

    // Assert
    expect(history.entries).toHaveLength(2);
  });

  it('should not merge when the coalesce key is null', () => {
    // Arrange
    const first = record(createHistory(100), entry('a', null));

    // Act
    const history = record(first, entry('b', null));

    // Assert
    expect(history.entries).toHaveLength(2);
  });

  it('should drop the oldest entry beyond the limit', () => {
    // Act
    let history = createHistory(2);
    history = record(history, entry('a', null));
    history = record(history, entry('b', null));
    history = record(history, entry('c', null));

    // Assert
    expect(history.entries.map((current) => current.label)).toEqual(['b', 'c']);
    expect(history.index).toBe(2);
  });
});
