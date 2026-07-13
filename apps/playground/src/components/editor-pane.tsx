import type { SvgSlide } from '@auto-deck/renderer-svg';
import type { ReactElement } from 'react';
import { SlideView } from '@/components/slide-view';
import { cn } from '@/lib/utils';

/**
 * Props for the EditorPane component.
 */
interface EditorPaneProps {
  /**
   * Extra classes merged onto the host element.
   */
  readonly className?: string;

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
export function EditorPane({ className, slide }: EditorPaneProps): ReactElement {
  return (
    <section
      className={cn('flex h-full flex-col justify-center overflow-auto bg-muted p-4', className)}
      aria-label="Editor"
    >
      {slide !== undefined && <SlideView className="shadow-md" svg={slide.svg} />}
    </section>
  );
}
