import type { Element, ElementId, Layout, Rect, Slide, SlotId } from '@auto-deck/schema';
import { emu, rect } from '@auto-deck/schema';
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
 * @returns The resolved slide, or the diagnostics that prevented resolution.
 */
export function resolveSlide(slide: Slide, layout: Layout, area: Rect): ResolveResult<ResolvedSlide> {
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

  // Compute the absolute bounds for each slot-bound element up front. A slot
  // without flow behaves like a flow slot holding exactly one element.
  const slotsById = new Map(layout.slots.map((slot) => [slot.id, slot] as const));
  const boundsById = new Map<ElementId, Rect>();
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

    const capacity = slot.flow === undefined ? 1 : (slot.flow.max ?? group.length);
    if (group.length > capacity) {
      diagnostics.push({
        code: 'slot-overfilled',
        slideId,
        slot: slotId,
        message: `Slot "${slotId}" on slide "${slideId}" holds at most ${capacity} element(s) but ${group.length} are bound to it.`,
      });
    }

    const gap = slot.flow === undefined ? 0 : resolveLength(slot.flow.gap, area.w);
    const count = Math.min(group.length, capacity);
    const cell = Math.round((region.w - (count - 1) * gap) / count);
    if (cell <= 0 || region.h <= 0) {
      diagnostics.push({
        code: 'invalid-geometry',
        slideId,
        slot: slotId,
        message: `Slot "${slotId}" on slide "${slideId}" resolves to a non-positive cell of ${cell}x${region.h} EMU.`,
      });
      continue;
    }
    const y = emu(region.y);
    const w = emu(cell);
    const h = emu(region.h);
    for (const [index, element] of group.slice(0, count).entries()) {
      const x = region.x + index * (cell + gap);
      boundsById.set(element.id, rect(emu(x), y, w, h));
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

    const bounds = element.bounds ?? boundsById.get(element.id);
    if (bounds === undefined) {
      // The unknown slot, overflow, or invalid geometry was already reported.
      continue;
    }
    const { slot: _slot, bounds: _bounds, ...rest } = element;
    resolved.push({ ...rest, bounds } as ResolvedElement);
  }

  if (diagnostics.length > 0) {
    return { success: false, diagnostics };
  }
  const { layoutId: _layoutId, elements: _elements, ...rest } = slide;
  return { success: true, value: { ...rest, elements: resolved } };
}
