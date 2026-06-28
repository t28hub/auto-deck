import type { Element, Rect } from '@auto-deck/schema';

/**
 * Drops the slot reference and requires absolute bounds.
 * Distributes over the {@link Element} union so each member keeps its discriminant.
 */
type Resolve<E> = E extends unknown
  ? Omit<E, 'slot' | 'bounds'> & { readonly bounds: Rect }
  : never;

/**
 * An element with its geometry fully resolved to absolute bounds.
 */
export type ResolvedElement = Resolve<Element>;
