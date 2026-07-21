import { Emu, type Layout, layoutSchema, rect, type Slide, slideSchema } from '@auto-deck/schema';
import { assert, describe, expect, it } from 'vitest';
import { resolveSlide } from './slide';

const AREA = rect(Emu.fromPixels(0), Emu.fromPixels(0), Emu.fromPixels(1280), Emu.fromPixels(720));

const TITLE_SLOT = {
  id: 'slot-title',
  styleToken: 'title',
  rect: { x: { ratio: 0 }, y: { ratio: 0 }, w: { ratio: 1 }, h: { ratio: 0.2 } },
};

const FLOW_SLOT = {
  id: 'slot-body',
  styleToken: 'body',
  rect: { x: { ratio: 0 }, y: { ratio: 0.28 }, w: { ratio: 1 }, h: { ratio: 0.6 } },
  flow: { gap: { ratio: 0.02 } },
};

const AUTHORED_BOUNDS = rect(Emu.fromPixels(10), Emu.fromPixels(20), Emu.fromPixels(30), Emu.fromPixels(40));

/**
 * Creates a valid fixture layout in wire format.
 */
function createLayout(slots: readonly unknown[]): Layout {
  return layoutSchema.parse({ id: 'layout-1', name: 'Layout', slots });
}

/**
 * Creates a valid fixture slide in wire format.
 */
function createSlide(elements: readonly unknown[]): Slide {
  return slideSchema.parse({ id: 'slide_000000000001', layoutId: 'layout-1', elements });
}

describe('resolveSlide', () => {
  it('should fill a slot-bound element with the slot region', () => {
    // Arrange
    const layout = createLayout([TITLE_SLOT]);
    const slide = createSlide([{ id: 'el_000000000001', type: 'text', slot: 'slot-title', text: 'Hello' }]);

    // Act
    const actual = resolveSlide(slide, layout, AREA);

    // Assert
    assert(actual.success, 'Expected slide resolution to succeed');
    expect(actual.value.elements).toHaveLength(1);
    expect(actual.value.elements[0]?.bounds).toEqual({
      x: Emu.fromPixels(0),
      y: Emu.fromPixels(0),
      w: Emu.fromPixels(1280),
      h: Emu.fromPixels(144),
    });
  });

  it('should distribute flow elements into equal cells separated by the gap', () => {
    // Arrange
    const layout = createLayout([FLOW_SLOT]);
    const slide = createSlide([
      { id: 'el_00000000000a', type: 'text', slot: 'slot-body', text: 'A' },
      { id: 'el_00000000000b', type: 'text', slot: 'slot-body', text: 'B' },
      { id: 'el_00000000000c', type: 'text', slot: 'slot-body', text: 'C' },
    ]);

    // Act
    const actual = resolveSlide(slide, layout, AREA);

    // Assert
    assert(actual.success, 'Expected slide resolution to succeed');
    const bounds = actual.value.elements.map((element) => element.bounds);
    expect(bounds.map((b) => b.x)).toEqual([Emu.fromPixels(0), Emu.fromPixels(435.2), Emu.fromPixels(870.4)]);
    for (const b of bounds) {
      expect(b).toMatchObject({ y: Emu.fromPixels(201.6), w: Emu.fromPixels(409.6), h: Emu.fromPixels(432) });
    }
  });

  it('should report slot-overfilled when flow capacity is exceeded', () => {
    // Arrange
    const layout = createLayout([{ ...FLOW_SLOT, flow: { gap: { ratio: 0.02 }, max: 2 } }]);
    const slide = createSlide([
      { id: 'el_00000000000a', type: 'text', slot: 'slot-body', text: 'A' },
      { id: 'el_00000000000b', type: 'text', slot: 'slot-body', text: 'B' },
      { id: 'el_00000000000c', type: 'text', slot: 'slot-body', text: 'C' },
    ]);

    // Act
    const actual = resolveSlide(slide, layout, AREA);

    // Assert
    assert(!actual.success, 'Expected slide resolution to fail due to slot overfill');
    expect(actual.diagnostics).toContainEqual(expect.objectContaining({ code: 'slot-overfilled', slot: 'slot-body' }));
  });

  it('should report slot-overfilled when a flowless slot holds more than one element', () => {
    // Arrange
    const layout = createLayout([TITLE_SLOT]);
    const slide = createSlide([
      { id: 'el_00000000000a', type: 'text', slot: 'slot-title', text: 'A' },
      { id: 'el_00000000000b', type: 'text', slot: 'slot-title', text: 'B' },
    ]);

    // Act
    const actual = resolveSlide(slide, layout, AREA);

    // Assert
    assert(!actual.success, 'Expected slide resolution to fail due to slot overfill');
    expect(actual.diagnostics).toContainEqual(expect.objectContaining({ code: 'slot-overfilled', slot: 'slot-title' }));
  });

  it('should report unknown-slot for an element bound to a missing slot', () => {
    // Arrange
    const layout = createLayout([TITLE_SLOT]);
    const slide = createSlide([{ id: 'el_000000000001', type: 'text', slot: 'slot-ghost', text: 'X' }]);

    // Act
    const actual = resolveSlide(slide, layout, AREA);

    // Assert
    assert(!actual.success, 'Expected slide resolution to fail due to unknown slot');
    expect(actual.diagnostics).toContainEqual(
      expect.objectContaining({ code: 'unknown-slot', elementId: 'el_000000000001', slot: 'slot-ghost' }),
    );
  });

  it('should let authored bounds override the slot geometry', () => {
    // Arrange
    const layout = createLayout([TITLE_SLOT]);
    const slide = createSlide([
      { id: 'el_000000000001', type: 'text', slot: 'slot-title', bounds: AUTHORED_BOUNDS, text: 'X' },
    ]);

    // Act
    const actual = resolveSlide(slide, layout, AREA);

    // Assert
    assert(actual.success, 'Expected slide resolution to succeed');
    expect(actual.value.elements[0]?.bounds).toEqual(AUTHORED_BOUNDS);
  });

  it('should keep an overridden element occupying its flow cell', () => {
    // Arrange
    const layout = createLayout([FLOW_SLOT]);
    const slide = createSlide([
      { id: 'el_00000000000a', type: 'text', slot: 'slot-body', text: 'A' },
      { id: 'el_00000000000b', type: 'text', slot: 'slot-body', bounds: AUTHORED_BOUNDS, text: 'B' },
      { id: 'el_00000000000c', type: 'text', slot: 'slot-body', text: 'C' },
    ]);

    // Act
    const actual = resolveSlide(slide, layout, AREA);

    // Assert
    assert(actual.success, 'Expected slide resolution to succeed');
    const [a, b, c] = actual.value.elements.map((element) => element.bounds);
    // The siblings keep the three-cell distribution as if B never moved.
    expect(a?.x).toEqual(Emu.fromPixels(0));
    expect(c?.x).toEqual(Emu.fromPixels(870.4));
    expect(b).toEqual(AUTHORED_BOUNDS);
  });

  it('should count an overridden element toward the slot capacity', () => {
    // Arrange
    const layout = createLayout([{ ...FLOW_SLOT, flow: { gap: { ratio: 0.02 }, max: 2 } }]);
    const slide = createSlide([
      { id: 'el_00000000000a', type: 'text', slot: 'slot-body', text: 'A' },
      { id: 'el_00000000000b', type: 'text', slot: 'slot-body', bounds: AUTHORED_BOUNDS, text: 'B' },
      { id: 'el_00000000000c', type: 'text', slot: 'slot-body', text: 'C' },
    ]);

    // Act
    const actual = resolveSlide(slide, layout, AREA);

    // Assert
    assert(!actual.success, 'Expected slide resolution to fail due to slot overfill');
    expect(actual.diagnostics).toContainEqual(expect.objectContaining({ code: 'slot-overfilled', slot: 'slot-body' }));
  });

  it('should report unknown-slot even when the element has authored bounds', () => {
    // Arrange
    const layout = createLayout([TITLE_SLOT]);
    const slide = createSlide([
      { id: 'el_000000000001', type: 'text', slot: 'slot-ghost', bounds: AUTHORED_BOUNDS, text: 'X' },
    ]);

    // Act
    const actual = resolveSlide(slide, layout, AREA);

    // Assert
    assert(!actual.success, 'Expected slide resolution to fail due to unknown slot');
    expect(actual.diagnostics).toContainEqual(
      expect.objectContaining({ code: 'unknown-slot', elementId: 'el_000000000001', slot: 'slot-ghost' }),
    );
  });

  it('should report missing-geometry when an element has neither a slot nor bounds', () => {
    // Arrange
    const layout = createLayout([TITLE_SLOT]);
    const slide = createSlide([{ id: 'el_000000000001', type: 'text', text: 'X' }]);

    // Act
    const actual = resolveSlide(slide, layout, AREA);

    // Assert
    assert(!actual.success, 'Expected slide resolution to fail due to missing geometry');
    expect(actual.diagnostics).toContainEqual(
      expect.objectContaining({ code: 'missing-geometry', elementId: 'el_000000000001' }),
    );
  });

  it('should report invalid-geometry when a slot resolves to a non-positive cell', () => {
    // Arrange
    const layout = createLayout([{ ...FLOW_SLOT, flow: { gap: { ratio: 0.9 } } }]);
    const slide = createSlide([
      { id: 'el_00000000000a', type: 'text', slot: 'slot-body', text: 'A' },
      { id: 'el_00000000000b', type: 'text', slot: 'slot-body', text: 'B' },
      { id: 'el_00000000000c', type: 'text', slot: 'slot-body', text: 'C' },
    ]);

    // Act
    const actual = resolveSlide(slide, layout, AREA);

    // Assert
    assert(!actual.success, 'Expected slide resolution to fail due to invalid geometry');
    expect(actual.diagnostics).toContainEqual(expect.objectContaining({ code: 'invalid-geometry', slot: 'slot-body' }));
  });

  it('should pass a free element through with its own bounds', () => {
    // Arrange
    const layout = createLayout([TITLE_SLOT]);
    const slide = createSlide([{ id: 'el_000000000001', type: 'text', bounds: AUTHORED_BOUNDS, text: 'X' }]);

    // Act
    const actual = resolveSlide(slide, layout, AREA);

    // Assert
    assert(actual.success, 'Expected slide resolution to succeed');
    expect(actual.value.elements[0]?.bounds).toEqual(AUTHORED_BOUNDS);
    expect(actual.value.elements[0]).not.toHaveProperty('slot');
  });

  it('should emit elements in their original order across slots and free bounds', () => {
    // Arrange
    const layout = createLayout([TITLE_SLOT]);
    const slide = createSlide([
      { id: 'el_00000000free', type: 'text', bounds: { x: 0, y: 0, w: 9525, h: 9525 }, text: 'F' },
      { id: 'el_0000000bound', type: 'text', slot: 'slot-title', text: 'B' },
    ]);

    // Act
    const actual = resolveSlide(slide, layout, AREA);

    // Assert
    assert(actual.success, 'Expected slide resolution to succeed');
    expect(actual.value.elements.map((element) => element.id)).toEqual(['el_00000000free', 'el_0000000bound']);
  });
});
