import type { Deck, DeckId } from '@auto-deck/schema';
import type { DeckRepository } from './deck-repository';

/**
 * A deck repository that keeps decks in an in-process map.
 */
export class InMemoryDeckRepository implements DeckRepository {
  private readonly decks: Map<DeckId, Deck>;

  /**
   * Creates the repository.
   *
   * @param seed - The decks the repository starts with.
   */
  constructor(seed: Iterable<Deck> = []) {
    this.decks = new Map(Array.from(seed, (deck) => [deck.id, deck]));
  }

  /**
   * Lists every stored deck in insertion order.
   *
   * @returns The stored decks.
   */
  async list(): Promise<readonly Deck[]> {
    return Array.from(this.decks.values());
  }

  /**
   * Loads a deck.
   *
   * @param id - The deck identifier.
   * @returns The deck, or null when no deck has the identifier.
   */
  async load(id: DeckId): Promise<Deck | null> {
    return this.decks.get(id) ?? null;
  }

  /**
   * Saves a deck under its own identifier, replacing any existing deck.
   *
   * @param deck - The deck to store.
   */
  async save(deck: Deck): Promise<void> {
    this.decks.set(deck.id, deck);
  }

  /**
   * Deletes the deck stored under the identifier if it exists.
   *
   * @param id - The deck identifier.
   */
  async delete(id: DeckId): Promise<void> {
    this.decks.delete(id);
  }
}
