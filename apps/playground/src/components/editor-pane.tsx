import type { SvgSlide } from '@auto-deck/renderer-svg';
import type { ReactElement } from 'react';
import { SlideView } from '@/components/slide-view';

/**
 * Props for the EditorPane component.
 */
interface EditorPaneProps {
  /**
   * The slide being edited, or undefined when the deck has no slides.
   */
  readonly slide: SvgSlide | undefined;
}

/**
 * The editor showing the slide being edited.
 * It provisionally renders the slide as a static preview until direct editing lands.
 *
 * @param props - The props for the EditorPane component.
 * @returns The editor region.
 */
export function EditorPane({ slide }: EditorPaneProps): ReactElement {
  return (
    <section className="flex h-full flex-col justify-center overflow-auto p-4" aria-label="Editor">
      {slide !== undefined && <SlideView svg={slide.svg} />}
    </section>
  );
}
