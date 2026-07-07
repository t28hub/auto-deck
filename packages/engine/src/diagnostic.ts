import type { ElementId, LayoutId, SlideId, SlotId } from '@auto-deck/schema';

/**
 * The outcome of a resolution step.
 */
export type ResolveResult<T> =
  | { readonly success: true; readonly value: T }
  | { readonly success: false; readonly diagnostics: readonly ResolveDiagnostic[] };

/**
 * A problem found while resolving a deck. Every diagnostic carries a
 * human-readable message plus the structured fields of its code.
 */
export type ResolveDiagnostic = { readonly message: string } & (
  | { readonly code: 'duplicate-layout-id'; readonly layoutId: LayoutId }
  | { readonly code: 'duplicate-slide-id'; readonly slideId: SlideId }
  | { readonly code: 'duplicate-element-id'; readonly elementId: ElementId }
  | { readonly code: 'unknown-layout'; readonly slideId: SlideId; readonly layoutId: LayoutId }
  | { readonly code: 'unknown-slot'; readonly slideId: SlideId; readonly elementId: ElementId; readonly slot: SlotId }
  | { readonly code: 'conflicting-geometry'; readonly slideId: SlideId; readonly elementId: ElementId }
  | { readonly code: 'missing-geometry'; readonly slideId: SlideId; readonly elementId: ElementId }
  | { readonly code: 'slot-overfilled'; readonly slideId: SlideId; readonly slot: SlotId }
  | { readonly code: 'invalid-geometry'; readonly slideId: SlideId; readonly slot: SlotId }
  | { readonly code: 'invalid-content-area' }
);
