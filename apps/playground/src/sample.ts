import { WIDESCREEN_16_9 } from '@auto-deck/schema';

/**
 * The deck shown when the playground loads: a title slide plus a three-column
 * flow slide. Serialized from an object so the sample can reference schema
 * constants and still read as the wire format users edit.
 */
export const SAMPLE_DECK: string = JSON.stringify(
  {
    id: 'deck-1',
    canvas: {
      id: 'canvas-1',
      displayName: 'Widescreen 16:9',
      size: WIDESCREEN_16_9,
    },
    layouts: [
      {
        id: 'title-content',
        name: 'Title and Content',
        slots: [
          {
            id: 'title',
            styleToken: 'title',
            rect: {
              x: { ratio: 0 },
              y: { ratio: 0 },
              w: { ratio: 1 },
              h: { ratio: 0.2 },
            },
          },
          {
            id: 'body',
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
        id: 'slide-1',
        layoutId: 'title-content',
        elements: [
          { id: 'el-title', type: 'text', slot: 'title', text: 'Auto Deck' },
          { id: 'el-col-1', type: 'text', slot: 'body', text: 'Schema' },
          { id: 'el-col-2', type: 'text', slot: 'body', text: 'Engine' },
          { id: 'el-col-3', type: 'text', slot: 'body', text: 'Renderer' },
        ],
      },
      {
        id: 'slide-2',
        layoutId: 'title-content',
        elements: [
          { id: 'el-title-2', type: 'text', slot: 'title', text: 'Playground' },
          { id: 'el-body-2', type: 'text', slot: 'body', text: 'Edit the JSON on the left.' },
        ],
      },
    ],
  },
  null,
  2,
);
