import { canvasId, type Deck, deckId, deckSchema, WIDESCREEN_16_9 } from '@auto-deck/schema';
import { describe, expect, it } from 'vitest';
import { InMemoryDeckRepository } from './in-memory-deck-repository';

/**
 * Creates a valid minimal deck with a fresh identifier.
 */
function createDeck(): Deck {
  return deckSchema.parse({
    id: deckId(),
    canvas: {
      id: canvasId(),
      displayName: 'Widescreen 16:9',
      size: { ...WIDESCREEN_16_9 },
    },
    layouts: [],
    slides: [],
  });
}

describe('InMemoryDeckRepository', () => {
  describe('list', () => {
    it('should return no decks when the repository is empty', async () => {
      // Arrange
      const repository = new InMemoryDeckRepository();

      // Act
      const actual = await repository.list();

      // Assert
      expect(actual).toStrictEqual([]);
    });

    it('should return the seeded decks in insertion order', async () => {
      // Arrange
      const deck1 = createDeck();
      const deck2 = createDeck();
      const repository = new InMemoryDeckRepository([deck1, deck2]);

      // Act
      const actual = await repository.list();

      // Assert
      expect(actual).toStrictEqual([deck1, deck2]);
    });
  });

  describe('load', () => {
    it('should return null when no deck has the identifier', async () => {
      // Arrange
      const repository = new InMemoryDeckRepository();

      // Act
      const actual = await repository.load(deckId());

      // Assert
      expect(actual).toBeNull();
    });

    it('should return a seeded deck', async () => {
      // Arrange
      const deck = createDeck();
      const repository = new InMemoryDeckRepository([deck]);

      // Act
      const actual = await repository.load(deck.id);

      // Assert
      expect(actual).toBe(deck);
    });
  });

  describe('save', () => {
    it('should store a deck under its own identifier', async () => {
      // Arrange
      const deck = createDeck();
      const repository = new InMemoryDeckRepository();

      // Act
      await repository.save(deck);

      // Assert
      await expect(repository.load(deck.id)).resolves.toBe(deck);
    });

    it('should replace the deck already stored under the identifier', async () => {
      // Arrange
      const oldDeck = createDeck();
      const newDeck = { ...oldDeck, canvas: { ...oldDeck.canvas, displayName: 'Replaced' } };
      const repository = new InMemoryDeckRepository([oldDeck]);

      // Act
      await repository.save(newDeck);

      // Assert
      const actual = repository.load(oldDeck.id);
      await expect(actual).resolves.toBe(newDeck);
    });

    it('should not affect other decks', async () => {
      // Arrange
      const deck1 = createDeck();
      const repository = new InMemoryDeckRepository([deck1]);

      // Act
      const deck2 = createDeck();
      await repository.save(deck2);

      // Assert
      const actual = repository.load(deck1.id);
      await expect(actual).resolves.toBe(deck1);
    });
  });

  describe('delete', () => {
    it('should remove the deck stored under the identifier', async () => {
      // Arrange
      const deck = createDeck();
      const repository = new InMemoryDeckRepository([deck]);

      // Act
      await repository.delete(deck.id);

      // Assert
      const actual = await repository.load(deck.id);
      await expect(actual).toBeNull();
    });

    it('should do nothing when no deck has the identifier', async () => {
      // Arrange
      const deck = createDeck();
      const repository = new InMemoryDeckRepository([deck]);

      // Act
      await repository.delete(deckId());

      // Assert
      const actual = await repository.list();
      await expect(actual).toStrictEqual([deck]);
    });
  });
});
