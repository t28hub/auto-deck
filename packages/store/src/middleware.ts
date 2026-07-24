import type { Deck } from '@auto-deck/schema';
import type { Command } from './command';

/**
 * Options that refine how a command is dispatched.
 */
export interface DispatchOptions {
  /**
   * Whether the command joins the undo history (`record`, the default) or
   * changes the deck without becoming undoable (`ignore`), for AI previews and
   * other programmatic edits that should not pollute undo.
   */
  readonly history?: 'record' | 'ignore';

  /**
   * Groups this command with the current top step when their keys match, so a
   * run of related edits (typing, a slider drag) undoes as a single step.
   */
  readonly coalesceKey?: string;

  /**
   * The human-readable name for the resulting undo step, shown next to
   * undo/redo. Lets the caller name the intent — "Resize element", or an AI's
   * own description — where the command type alone cannot. Defaults to a label
   * derived from the command.
   */
  readonly label?: string;
}

/**
 * Sends a change request to the store.
 */
export type Dispatch = (command: Command, options?: DispatchOptions) => void;

/**
 * The store surface a middleware may read while handling a command.
 */
export interface MiddlewareApi {
  /**
   * Returns the current deck.
   */
  getDeck(): Deck;
}

/**
 * Wraps command dispatch to observe or amend it — logging, validation, an AI
 * audit trail. Each middleware receives the next dispatch in the chain and
 * returns its own; call `next` to continue, or skip it to drop the command.
 */
export type Middleware = (api: MiddlewareApi) => (next: Dispatch) => Dispatch;

/**
 * Composes the middleware chain around a base dispatch. The first middleware in
 * the array is the outermost, so it sees each command first.
 *
 * @param api - The store surface handed to every middleware.
 * @param middleware - The chain to apply, outermost first.
 * @param base - The dispatch the innermost middleware wraps.
 * @returns The composed dispatch.
 */
export function applyMiddleware(api: MiddlewareApi, middleware: readonly Middleware[], base: Dispatch): Dispatch {
  return middleware.reduceRight((next, wrap) => wrap(api)(next), base);
}
