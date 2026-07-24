# `@auto-deck/store`

The single source of truth for a deck being edited.  
Every change is a serializable `Command` dispatched through one place, recorded as a bounded, labeled undo/redo history, and observable through a subscription.
The package is framework-agnostic: a view layer (the Playground's Zustand store, a Tauri app, a CLI, an MCP server) subscribes to it rather than owning the deck.

## Installation

From a workspace package directory:

```sh
pnpm add @auto-deck/store --workspace
```

## Commands

A `Command` is the one unit of change, plain and serializable, that both the UI and an AI agent produce.

| Command             | Effect                                                        |
|:--------------------|:--------------------------------------------------------------|
| `setElementBounds`  | Gives an element new bounds                                   |
| `setElementText`    | Gives a text element new text                                 |
| `addElement`        | Inserts an element into a slide (appends without an `index`)  |
| `removeElement`     | Removes an element from a slide                               |
| `addSlide`          | Inserts a slide into the deck (appends without an `index`)    |
| `removeSlide`       | Removes a slide from the deck                                 |

A command that changes nothing (identical bounds, missing target) is a no-op and never enters history.

## Store

`createDeckStore(deck, options?)` returns a `DeckStore`. Options are `limit` (the most undo steps to keep, default 100) and `middleware`.

| Member                        | Behavior                                                             |
|:------------------------------|:--------------------------------------------------------------------|
| `getDeck()`                   | Returns the current deck                                             |
| `dispatch(command, options?)` | Applies a command, recording it unless told otherwise               |
| `beginInteraction()`          | Opens a gesture whose commands collapse into one undo step          |
| `commitInteraction(label?)`   | Closes the gesture, recording it as one step                        |
| `cancelInteraction()`         | Abandons the gesture, reverting the deck without recording          |
| `undo()` / `redo()`           | Moves one step back / forward                                       |
| `canUndo()` / `canRedo()`     | Whether a step exists to undo / redo                                |
| `undoLabel()` / `redoLabel()` | The label of that step, or `null`                                   |
| `subscribe(listener)`         | Calls the listener after every change; returns an unsubscribe       |

`dispatch` takes options that refine a single change:

| Option        | Effect                                                                         |
|:--------------|:-------------------------------------------------------------------------------|
| `label`       | Names the resulting undo step; defaults to a label from the command type       |
| `coalesceKey` | Merges the command into the current step when the keys match                   |
| `history`     | `'ignore'` applies the command without recording it (AI previews, remote edits)|

## Usage

Dispatch a change, then undo and redo it:

```ts
import { createDeckStore } from '@auto-deck/store';

const store = createDeckStore(deck);
store.dispatch({ type: 'setElementText', slideId, elementId, text: 'Hello' });
store.undo();
store.redo();
```

Collapse a gesture — a drag streams many commands but undoes as one step:

```ts
store.beginInteraction();
// on each pointer move:
store.dispatch({ type: 'setElementBounds', slideId, elementId, bounds });
store.commitInteraction('Move element'); // or store.cancelInteraction() to abandon
```

Merge a burst of edits — typing undoes as one step:

```ts
store.dispatch({ type: 'setElementText', slideId, elementId, text }, { coalesceKey: `text:${elementId}` });
```

Apply a change without touching history — an AI preview the user has not accepted:

```ts
store.dispatch(command, { history: 'ignore' });
```

Wrap dispatch with middleware — logging, validation, an AI audit trail:

```ts
import { createDeckStore, type Middleware } from '@auto-deck/store';

const logging: Middleware = () => (next) => (command, options) => {
  console.log(command.type);
  next(command, options);
};

const store = createDeckStore(deck, { middleware: [logging], limit: 50 });
```

Bind a view — re-render on every change:

```ts
const unsubscribe = store.subscribe(() => render(store.getDeck()));
```
