# @auto-deck/repository

Repository contract and implementations for persisting decks.
The contract speaks the domain type `Deck`, so how a deck is represented at rest stays inside each implementation.

## Installation

From a workspace package directory:

```sh
pnpm add @auto-deck/repository --workspace
```

## Contract

`DeckRepository` is the whole storage contract.

| Method       | Behavior                                                        |
|:-------------|:----------------------------------------------------------------|
| `list()`     | Returns every stored deck in no guaranteed order                |
| `load(id)`   | Returns the deck, or `null` when no deck has the identifier     |
| `save(deck)` | Stores the deck under `deck.id`, replacing any existing deck    |
| `delete(id)` | Removes the deck if it exists                                   |

The absence of a deck is not an error.
Storage failures throw `DeckRepositoryError` with the underlying error as `cause`.

## Implementations

| Implementation           | Backing store                                          |
|:-------------------------|:-------------------------------------------------------|
| `InMemoryDeckRepository` | An in-process map that lives as long as the instance   |

## Usage

Instantiate an implementation once at the app's composition root and depend on the interface everywhere else.
Swapping the destination (browser storage, a local database, a remote API) then touches that one file only.

```ts
// apps/playground/src/repository.ts
import { type DeckRepository, InMemoryDeckRepository } from '@auto-deck/repository';
import { SAMPLE_DECK } from '@/sample';

export const deckRepository: DeckRepository = new InMemoryDeckRepository([SAMPLE_DECK]);
```

```ts
const deck = await deckRepository.load(deckId);
```
