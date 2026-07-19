import { useCallback, useState } from 'react';

/**
 * Options for the useLocalStorage hook.
 */
interface UseLocalStorageOptions<T> {
  /**
   * The function that converts the value to a string for storage;
   * defaults to JSON.stringify. Pass an identity function to store a
   * string value as-is.
   */
  readonly serialize?: (value: T) => string;

  /**
   * The function that converts the stored string back to a value;
   * defaults to JSON.parse. localStorage is external input, so prefer a
   * validating implementation over a cast; throw for irrecoverable input
   * to fall back to the initial value.
   */
  readonly deserialize?: (stored: string) => T;
}

/**
 * The value and storage operations returned by the useLocalStorage hook.
 */
interface UseLocalStorageResult<T> {
  /**
   * The current value.
   */
  readonly value: T;

  /**
   * Persists the given value and applies it.
   */
  readonly setValue: (value: T) => void;

  /**
   * Removes the value from storage and resets it to the initial one.
   */
  readonly removeValue: () => void;
}

/**
 * A React hook that synchronizes a state value with localStorage.
 *
 * @param key - The localStorage key to use.
 * @param initialValue - The initial value to use if there is no stored value.
 * @param options - Optional serialization and deserialization functions.
 * @returns The current value and the operations that persist or remove it.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {},
): UseLocalStorageResult<T> {
  const { serialize = JSON.stringify, deserialize = JSON.parse as (stored: string) => T } = options;

  const [value, setValueState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored === null) {
        return initialValue;
      }
      return deserialize(stored);
    } catch {
      // Storage access may be blocked (e.g., private mode), so fall back to the initial value.
      return initialValue;
    }
  });

  const setValue = useCallback(
    (next: T): void => {
      setValueState(next);
      try {
        localStorage.setItem(key, serialize(next));
      } catch {
        // Storage access may be blocked (e.g., private mode), so fall back to the in-memory state.
      }
    },
    [key, serialize],
  );

  const removeValue = useCallback((): void => {
    setValueState(initialValue);
    try {
      localStorage.removeItem(key);
    } catch {
      // Storage access may be blocked (e.g., private mode), so fall back to the in-memory state.
    }
  }, [key, initialValue]);

  return { value, setValue, removeValue };
}
