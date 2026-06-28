import type { Id, LayoutId, SlotId } from '@auto-deck/schema';

/**
 * The outcome of a resolution step.
 */
export type ResolveResult<T> =
  | { readonly success: true; readonly value: T }
  | { readonly success: false; readonly diagnostics: readonly ResolveDiagnostic[] };

/**
 * A problem found while resolving a deck.
 */
export type ResolveDiagnostic =
  | {
      readonly code: 'duplicate-layout-id';
      readonly layoutId: LayoutId;
      readonly message: string;
    }
  | {
      readonly code: 'duplicate-slide-id';
      readonly slideId: Id;
      readonly message: string;
    }
  | {
      readonly code: 'duplicate-element-id';
      readonly elementId: Id;
      readonly message: string;
    }
  | {
      readonly code: 'unknown-layout';
      readonly slideId: Id;
      readonly layoutId: LayoutId;
      readonly message: string;
    }
  | {
      readonly code: 'unknown-slot';
      readonly slideId: Id;
      readonly elementId: Id;
      readonly slot: SlotId;
      readonly message: string;
    }
  | {
      readonly code: 'conflicting-geometry';
      readonly slideId: Id;
      readonly elementId: Id;
      readonly message: string;
    }
  | {
      readonly code: 'missing-geometry';
      readonly slideId: Id;
      readonly elementId: Id;
      readonly message: string;
    }
  | {
      readonly code: 'slot-overfilled';
      readonly slideId: Id;
      readonly slot: SlotId;
      readonly message: string;
    };
