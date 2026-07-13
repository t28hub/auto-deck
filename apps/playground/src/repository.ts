import { type DeckRepository, InMemoryDeckRepository } from '@auto-deck/repository';
import type { DeckId } from '@auto-deck/schema';
import { SAMPLE_DECK } from '@/sample';

export const deckRepository: DeckRepository = new InMemoryDeckRepository([SAMPLE_DECK]);

/**
 * The deck the playground opens on launch.
 */
export const INITIAL_DECK_ID: DeckId = SAMPLE_DECK.id;
