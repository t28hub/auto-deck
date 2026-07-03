import type { Element, Id, Layout, Rect, Slide, SlotId } from '@auto-deck/schema';
import { rectSchema } from '@auto-deck/schema';
import type { ResolveDiagnostic, ResolveResult } from './diagnostic';
import type { ResolvedElement } from './element';
import { resolveLength } from './length';

/**
 * A slide whose elements are fully resolved.
 */
export type ResolvedSlide = Omit<Slide, 'layoutId' | 'elements'> & {
  readonly elements: readonly ResolvedElement[];
};

/**
 * Resolves a slide's elements against its layout into absolute geometry.
 *
 * @param slide - The slide to resolve.
 * @param layout - The layout the slide uses.
 * @param area - The absolute content area, in EMU.
 * @returns The resolved elements, or the diagnostics that prevented resolution.
 */
export function resolveSlide(slide: Slide, layout: Layout, area: Rect): ResolveResult<readonly ResolvedElement[]> {
  const { id: slideId, elements } = slide;
  const diagnostics: ResolveDiagnostic[] = [];

  // Group the slot-bound elements by slot, preserving element order.
  const groups = new Map<SlotId, Element[]>();
  for (const element of elements) {
    if (element.slot !== undefined && element.bounds === undefined) {
      const group = groups.get(element.slot);
      if (group) {
        group.push(element);
      } else {
        groups.set(element.slot, [element]);
      }
    }
  }

  // Compute the absolute bounds for each slot-bound element up front.
  const slotsById = new Map(layout.slots.map((slot) => [slot.id, slot] as const));
  const boundsById = new Map<Id, Rect>();
  for (const [slotId, group] of groups) {
    const slot = slotsById.get(slotId);
    if (slot === undefined) {
      for (const element of group) {
        diagnostics.push({
          code: 'unknown-slot',
          slideId,
          elementId: element.id,
          slot: slotId,
          message: `Element "${element.id}" on slide "${slideId}" references unknown slot "${slotId}" in its layout.`,
        });
      }
      continue;
    }

    const region = {
      x: area.x + resolveLength(slot.rect.x, area.w),
      y: area.y + resolveLength(slot.rect.y, area.h),
      w: resolveLength(slot.rect.w, area.w),
      h: resolveLength(slot.rect.h, area.h),
    };

    if (slot.flow !== undefined) {
      const capacity = slot.flow.max ?? group.length;
      if (group.length > capacity) {
        diagnostics.push({
          code: 'slot-overfilled',
          slideId,
          slot: slotId,
          message: `Slot "${slotId}" on slide "${slideId}" holds at most ${capacity} element(s) but ${group.length} are bound to it.`,
        });
      }
      const count = Math.min(group.length, capacity);
      if (count > 0) {
        const gap = resolveLength(slot.flow.gap, area.w);
        const cell = (region.w - (count - 1) * gap) / count;
        for (const [index, element] of group.slice(0, count).entries()) {
          const x = region.x + index * (cell + gap);
          boundsById.set(element.id, makeRect(x, region.y, cell, region.h));
        }
      }
    } else {
      if (group.length > 1) {
        diagnostics.push({
          code: 'slot-overfilled',
          slideId,
          slot: slotId,
          message: `Slot "${slotId}" on slide "${slideId}" has no flow and holds one element but ${group.length} are bound to it.`,
        });
      }
      // Groups are built non-empty, so the first element always exists.
      const [first] = group;
      if (first !== undefined) {
        boundsById.set(first.id, makeRect(region.x, region.y, region.w, region.h));
      }
    }
  }

  // Emit elements in their original order.
  const resolved: ResolvedElement[] = [];
  for (const element of elements) {
    const hasSlot = element.slot !== undefined;
    const hasBounds = element.bounds !== undefined;

    if (hasSlot && hasBounds) {
      diagnostics.push({
        code: 'conflicting-geometry',
        slideId,
        elementId: element.id,
        message: `Element "${element.id}" on slide "${slideId}" has both a slot and bounds; exactly one is allowed.`,
      });
      continue;
    }
    if (!hasSlot && !hasBounds) {
      diagnostics.push({
        code: 'missing-geometry',
        slideId,
        elementId: element.id,
        message: `Element "${element.id}" on slide "${slideId}" has neither a slot nor bounds.`,
      });
      continue;
    }

    if (hasBounds) {
      const { slot: _slot, ...rest } = element;
      resolved.push(rest as ResolvedElement);
      continue;
    }

    const bounds = boundsById.get(element.id);
    if (bounds === undefined) {
      // The unknown slot or overflow was already reported.
      continue;
    }
    const { slot: _slot, bounds: _bounds, ...rest } = element;
    resolved.push({ ...rest, bounds } as ResolvedElement);
  }

  if (diagnostics.length > 0) {
    return { success: false, diagnostics };
  }
  return { success: true, value: resolved };
}

/**
 * Builds a {@link Rect} from EMU numbers, rounding each to the nearest integer.
 *
 * @param x - The left edge in EMU.
 * @param y - The top edge in EMU.
 * @param w - The width in EMU.
 * @param h - The height in EMU.
 * @returns The validated rectangle.
 */
function makeRect(x: number, y: number, w: number, h: number): Rect {
  return rectSchema.parse({
    x: Math.round(x),
    y: Math.round(y),
    w: Math.round(w),
    h: Math.round(h),
  });
}
