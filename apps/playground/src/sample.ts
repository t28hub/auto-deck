import { deckSchema, WIDESCREEN_16_9 } from '@auto-deck/schema';

/**
 * The deck shown when the playground loads: a title slide plus a three-column
 * flow slide. Serialized from an object so the sample can reference schema
 * constants and still read as the wire format users edit; parsed through the
 * deck schema so drift in the id format or the model breaks loudly at load.
 */
export const SAMPLE_DECK: string = JSON.stringify(
  deckSchema.parse({
    id: 'deck_k2x9m4q7r1s8',
    canvas: {
      id: 'canvas_p3n8v2c6t9w4',
      displayName: 'Widescreen 16:9',
      size: WIDESCREEN_16_9,
    },
    layouts: [
      {
        id: 'layout-title-content',
        name: 'Title and Content',
        slots: [
          {
            id: 'slot-title',
            styleToken: 'title',
            rect: {
              x: { ratio: 0 },
              y: { ratio: 0 },
              w: { ratio: 1 },
              h: { ratio: 0.2 },
            },
          },
          {
            id: 'slot-body',
            styleToken: 'body',
            rect: {
              x: { ratio: 0 },
              y: { ratio: 0.28 },
              w: { ratio: 1 },
              h: { ratio: 0.6 },
            },
            flow: {
              gap: { ratio: 0.02 },
              max: 3,
            },
          },
        ],
      },
    ],
    slides: [
      {
        id: 'slide_a1b2c3d4e5f6',
        layoutId: 'layout-title-content',
        elements: [
          { id: 'el_h4t8k2m9x1q5', type: 'text', slot: 'slot-title', text: 'Auto Deck' },
          { id: 'el_a9s3d7f1g5h2', type: 'text', slot: 'slot-body', text: 'Schema' },
          { id: 'el_z2x6c4v8b3n7', type: 'text', slot: 'slot-body', text: 'Engine' },
          { id: 'el_q5w1e9r4t8y2', type: 'text', slot: 'slot-body', text: 'Renderer' },
        ],
      },
      {
        id: 'slide_f6e5d4c3b2a1',
        layoutId: 'layout-title-content',
        elements: [
          { id: 'el_m3n7b2v6c9x4', type: 'text', slot: 'slot-title', text: 'Playground' },
          { id: 'el_j8k4l2h6g9f3', type: 'text', slot: 'slot-body', text: 'Edit the JSON on the left.' },
        ],
      },
    ],
  }),
  null,
  2,
);
