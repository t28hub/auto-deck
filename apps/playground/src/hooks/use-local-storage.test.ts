import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useLocalStorage } from './use-local-storage';

const KEY = 'use-local-storage-test';

/**
 * Converts a number to and from its hexadecimal string representation.
 */
const HEX_OPTIONS = {
  serialize: (value: number): string => value.toString(16),
  deserialize: (stored: string): number => Number.parseInt(stored, 16),
};

/**
 * Replaces the localStorage global with a stub that delegates to the real
 * storage while overriding the given methods. The stub stays complete so the
 * tests do not depend on which storage methods the hook happens to call.
 *
 * @param overrides - The storage methods to replace.
 */
function stubLocalStorage(overrides: Partial<Storage>): void {
  const storage = localStorage;
  vi.stubGlobal('localStorage', {
    getItem: (key: string): string | null => storage.getItem(key),
    setItem: (key: string, value: string): void => storage.setItem(key, value),
    removeItem: (key: string): void => storage.removeItem(key),
    ...overrides,
  });
}

describe('useLocalStorage', () => {
  afterEach(() => {
    // Teardown
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('should return the initial value when nothing is stored', () => {
    // Exercise
    const { result } = renderHook(() => useLocalStorage(KEY, 'Hello, world.'));

    // Verify
    const actual = result.current;
    expect(actual.value).toBe('Hello, world.');
  });

  it('should deserialize the stored value with JSON.parse by default', () => {
    // Setup
    localStorage.setItem(KEY, JSON.stringify({ count: 1 }));

    // Exercise
    const { result } = renderHook(() => useLocalStorage(KEY, { count: 0 }));

    // Verify
    const actual = result.current;
    expect(actual.value).toEqual({ count: 1 });
  });

  it('should serialize the value with JSON.stringify by default when setValue is called', () => {
    // Setup
    const { result } = renderHook(() => useLocalStorage(KEY, { count: 0 }));

    // Exercise
    act(() => {
      result.current.setValue({ count: 2 });
    });

    // Verify
    const actual = result.current;
    expect(actual.value).toEqual({ count: 2 });
    expect(localStorage.getItem(KEY)).toBe('{"count":2}');
  });

  it('should reset to the initial value and clear storage when removeValue is called', () => {
    // Setup
    localStorage.setItem(KEY, JSON.stringify('stored'));
    const { result } = renderHook(() => useLocalStorage(KEY, 'Hello, world.'));

    // Exercise
    act(() => {
      result.current.removeValue();
    });

    // Verify
    const actual = result.current;
    expect(actual.value).toBe('Hello, world.');
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it('should read the stored value with a custom deserialize function', () => {
    // Setup
    localStorage.setItem(KEY, '12B');

    // Exercise
    const { result } = renderHook(() => useLocalStorage(KEY, 1024, HEX_OPTIONS));

    // Verify
    const actual = result.current;
    expect(actual.value).toBe(299);
  });

  it('should write the value with a custom serialize function', () => {
    // Setup
    const { result } = renderHook(() => useLocalStorage(KEY, 1024, HEX_OPTIONS));

    // Exercise
    act(() => {
      result.current.setValue(2048);
    });

    // Verify
    const actual = localStorage.getItem(KEY);
    expect(actual).toBe('800');
  });

  it('should fall back to the initial value when deserialize throws', () => {
    // Setup
    localStorage.setItem(KEY, '{invalid json');

    // Exercise
    const { result } = renderHook(() => useLocalStorage(KEY, 'fallback'));

    // Verify
    const actual = result.current;
    expect(actual.value).toBe('fallback');
  });

  it('should fall back to the initial value when reading from storage throws', () => {
    // Setup
    localStorage.setItem(KEY, JSON.stringify('stored'));
    const getItem = vi.fn((): string => {
      throw new DOMException('Storage is blocked.', 'SecurityError');
    });
    stubLocalStorage({ getItem });

    // Exercise
    const { result } = renderHook(() => useLocalStorage(KEY, 'fallback'));

    // Verify
    const actual = result.current;
    expect(actual.value).toBe('fallback');
    expect(getItem).toHaveBeenCalledWith(KEY);
  });

  it('should keep the in-memory value when writing to storage throws', () => {
    // Setup
    const setItem = vi.fn((): void => {
      throw new DOMException('Quota exceeded.', 'QuotaExceededError');
    });
    stubLocalStorage({ setItem });
    const { result } = renderHook(() => useLocalStorage(KEY, 'initial'));

    // Exercise
    act(() => {
      result.current.setValue('updated');
    });

    // Verify
    const actual = result.current;
    expect(actual.value).toBe('updated');
    expect(setItem).toHaveBeenCalledWith(KEY, JSON.stringify('updated'));
  });

  it('should reset to the initial value when removing from storage throws', () => {
    // Setup
    localStorage.setItem(KEY, JSON.stringify('stored'));
    const removeItem = vi.fn((): void => {
      throw new DOMException('Storage is blocked.', 'SecurityError');
    });
    stubLocalStorage({ removeItem });
    const { result } = renderHook(() => useLocalStorage(KEY, 'fallback'));

    // Exercise
    act(() => {
      result.current.removeValue();
    });

    // Verify
    const actual = result.current;
    expect(actual.value).toBe('fallback');
    expect(removeItem).toHaveBeenCalledWith(KEY);
  });
});
