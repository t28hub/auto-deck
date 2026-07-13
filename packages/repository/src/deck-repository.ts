import type { Deck, DeckId } from '@auto-deck/schema';

/**
 * Signals that the storage behind a repository failed.
 */
export class DeckRepositoryError extends Error {
  /**
   * Creates the error.
   *
   * @param message - What operation failed and why.
   * @param options - Standard error options such as the underlying `cause`.
   */
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'DeckRepositoryError';
  }
}

/**
 * Persists decks keyed by their identifier, leaving the representation at rest to each implementation.
 */
export interface DeckRepository {
  /**
   * Lists every stored deck in no guaranteed order.
   *
   * @returns The stored decks.
   * @throws {DeckRepositoryError} If the underlying storage fails or holds data that no longer parses as a deck.
   */
  list(): Promise<readonly Deck[]>;

  /**
   * Loads a deck.
   *
   * @param id - The deck identifier.
   * @returns The deck, or null when no deck has the identifier.
   * @throws {DeckRepositoryError} If the underlying storage fails or holds data that no longer parses as a deck.
   */
  load(id: DeckId): Promise<Deck | null>;

  /**
   * Saves a deck under its own identifier, replacing any existing deck.
   *
   * @param deck - The deck to store.
   * @throws {DeckRepositoryError} If the underlying storage fails.
   */
  save(deck: Deck): Promise<void>;

  /**
   * Deletes the deck stored under the identifier if it exists.
   *
   * @param id - The deck identifier.
   * @throws {DeckRepositoryError} If the underlying storage fails.
   */
  delete(id: DeckId): Promise<void>;
}
