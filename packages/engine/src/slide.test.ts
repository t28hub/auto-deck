import { type Layout, layoutSchema, pixels, rect, type Slide, slideSchema } from '@auto-deck/schema';
import { assert, describe, expect, it } from 'vitest';
import { resolveSlide } from './slide';

const AREA = rect(pixels(0), pixels(0), pixels(1280), pixels(720));

const TITLE_SLOT = {
  id: 'title',
  styleToken: 'title',
  rect: { x: { ratio: 0 }, y: { ratio: 0 }, w: { ratio: 1 }, h: { ratio: 0.2 } },
};

const FLOW_SLOT = {
  id: 'body',
  styleToken: 'body',
  rect: { x: { ratio: 0 }, y: { ratio: 0.28 }, w: { ratio: 1 }, h: { ratio: 0.6 } },
  flow: { gap: { ratio: 0.02 } },
};

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
  return slideSchema.parse({ id: 'slide-1', layoutId: 'layout-1', elements });
}

describe('resolveSlide', () => {
  it('should fill a slot-bound element with the slot region', () => {
    // Arrange
    const layout = createLayout([TITLE_SLOT]);
    const slide = createSlide([{ id: 'el-1', type: 'text', slot: 'title', text: 'Hello' }]);

    // Act
    const actual = resolveSlide(slide, layout, AREA);

    // Assert
    assert(actual.success, 'Expected slide resolution to succeed');
    expect(actual.value.elements).toHaveLength(1);
    expect(actual.value.elements[0]?.bounds).toEqual({
      x: pixels(0),
      y: pixels(0),
      w: pixels(1280),
      h: pixels(144),
    });
  });

  it('should distribute flow elements into equal cells separated by the gap', () => {
    // Arrange
    const layout = createLayout([FLOW_SLOT]);
    const slide = createSlide([
      { id: 'a', type: 'text', slot: 'body', text: 'A' },
      { id: 'b', type: 'text', slot: 'body', text: 'B' },
      { id: 'c', type: 'text', slot: 'body', text: 'C' },
    ]);

    // Act
    const actual = resolveSlide(slide, layout, AREA);

    // Assert
    assert(actual.success, 'Expected slide resolution to succeed');
    const bounds = actual.value.elements.map((element) => element.bounds);
    expect(bounds.map((b) => b.x)).toEqual([pixels(0), pixels(435.2), pixels(870.4)]);
    for (const b of bounds) {
      expect(b).toMatchObject({ y: pixels(201.6), w: pixels(409.6), h: pixels(432) });
    }
  });

  it('should report slot-overfilled when flow capacity is exceeded', () => {
    // Arrange
    const layout = createLayout([{ ...FLOW_SLOT, flow: { gap: { ratio: 0.02 }, max: 2 } }]);
    const slide = createSlide([
      { id: 'a', type: 'text', slot: 'body', text: 'A' },
      { id: 'b', type: 'text', slot: 'body', text: 'B' },
      { id: 'c', type: 'text', slot: 'body', text: 'C' },
    ]);

    // Act
    const actual = resolveSlide(slide, layout, AREA);

    // Assert
    assert(!actual.success, 'Expected slide resolution to fail due to slot overfill');
    expect(actual.diagnostics).toContainEqual(expect.objectContaining({ code: 'slot-overfilled', slot: 'body' }));
  });

  it('should report slot-overfilled when a flowless slot holds more than one element', () => {
    // Arrange
    const layout = createLayout([TITLE_SLOT]);
    const slide = createSlide([
      { id: 'a', type: 'text', slot: 'title', text: 'A' },
      { id: 'b', type: 'text', slot: 'title', text: 'B' },
    ]);

    // Act
    const actual = resolveSlide(slide, layout, AREA);

    // Assert
    assert(!actual.success, 'Expected slide resolution to fail due to slot overfill');
    expect(actual.diagnostics).toContainEqual(expect.objectContaining({ code: 'slot-overfilled', slot: 'title' }));
  });

  it('should report unknown-slot for an element bound to a missing slot', () => {
    // Arrange
    const layout = createLayout([TITLE_SLOT]);
    const slide = createSlide([{ id: 'el-1', type: 'text', slot: 'ghost', text: 'X' }]);

    // Act
    const actual = resolveSlide(slide, layout, AREA);

    // Assert
    assert(!actual.success, 'Expected slide resolution to fail due to unknown slot');
    expect(actual.diagnostics).toContainEqual(
      expect.objectContaining({ code: 'unknown-slot', elementId: 'el-1', slot: 'ghost' }),
    );
  });

  it('should report conflicting-geometry when an element has both a slot and bounds', () => {
    // Arrange
    const layout = createLayout([TITLE_SLOT]);
    const slide = createSlide([
      { id: 'el-1', type: 'text', slot: 'title', bounds: { x: 0, y: 0, w: 9525, h: 9525 }, text: 'X' },
    ]);

    // Act
    const actual = resolveSlide(slide, layout, AREA);

    // Assert
    assert(!actual.success, 'Expected slide resolution to fail due to conflicting geometry');
    expect(actual.diagnostics).toContainEqual(
      expect.objectContaining({ code: 'conflicting-geometry', elementId: 'el-1' }),
    );
  });

  it('should report missing-geometry when an element has neither a slot nor bounds', () => {
    // Arrange
    const layout = createLayout([TITLE_SLOT]);
    const slide = createSlide([{ id: 'el-1', type: 'text', text: 'X' }]);

    // Act
    const actual = resolveSlide(slide, layout, AREA);

    // Assert
    assert(!actual.success, 'Expected slide resolution to fail due to missing geometry');
    expect(actual.diagnostics).toContainEqual(expect.objectContaining({ code: 'missing-geometry', elementId: 'el-1' }));
  });

  it('should report invalid-geometry when a slot resolves to a non-positive cell', () => {
    // Arrange
    const layout = createLayout([{ ...FLOW_SLOT, flow: { gap: { ratio: 0.9 } } }]);
    const slide = createSlide([
      { id: 'a', type: 'text', slot: 'body', text: 'A' },
      { id: 'b', type: 'text', slot: 'body', text: 'B' },
      { id: 'c', type: 'text', slot: 'body', text: 'C' },
    ]);

    // Act
    const actual = resolveSlide(slide, layout, AREA);

    // Assert
    assert(!actual.success, 'Expected slide resolution to fail due to invalid geometry');
    expect(actual.diagnostics).toContainEqual(expect.objectContaining({ code: 'invalid-geometry', slot: 'body' }));
  });

  it('should pass a free element through with its own bounds', () => {
    // Arrange
    const layout = createLayout([TITLE_SLOT]);
    const bounds = {
      x: pixels(10),
      y: pixels(20),
      w: pixels(30),
      h: pixels(40),
    };
    const slide = createSlide([{ id: 'el-1', type: 'text', bounds, text: 'X' }]);

    // Act
    const actual = resolveSlide(slide, layout, AREA);

    // Assert
    assert(actual.success, 'Expected slide resolution to succeed');
    expect(actual.value.elements[0]?.bounds).toEqual(bounds);
    expect(actual.value.elements[0]).not.toHaveProperty('slot');
  });

  it('should emit elements in their original order across slots and free bounds', () => {
    // Arrange
    const layout = createLayout([TITLE_SLOT]);
    const slide = createSlide([
      { id: 'free', type: 'text', bounds: { x: 0, y: 0, w: 9525, h: 9525 }, text: 'F' },
      { id: 'bound', type: 'text', slot: 'title', text: 'B' },
    ]);

    // Act
    const actual = resolveSlide(slide, layout, AREA);

    // Assert
    assert(actual.success, 'Expected slide resolution to succeed');
    expect(actual.value.elements.map((element) => element.id)).toEqual(['free', 'bound']);
  });
});
