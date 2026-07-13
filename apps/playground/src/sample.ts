import { type Deck, deckSchema } from '@auto-deck/schema';
import sampleDeck from '@/assets/sample-deck.json';

/**
 * The deck shown when the playground loads, a title slide plus a three-column
 * flow slide. The asset is parsed through the deck schema so drift in the id
 * format or the model breaks loudly at load.
 */
export const SAMPLE_DECK: Deck = deckSchema.parse(sampleDeck);
