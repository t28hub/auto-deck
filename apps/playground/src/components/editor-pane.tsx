import type { ElementId } from '@auto-deck/schema';
import type { ReactElement } from 'react';
import type { CompiledSlide } from '@/compile';
import { ElementOverlay } from '@/components/element-overlay';
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
   * The identifier of the element highlighted as selected.
   */
  readonly selectedElementId: ElementId | null;

  /**
   * The slide being edited, or undefined when the deck has no slides.
   */
  readonly slide: CompiledSlide | undefined;
}

/**
 * The editor showing the slide being edited, with an interaction overlay for
 * selecting and dragging its elements.
 *
 * @param props - The props for the EditorPane component.
 * @returns The editor region.
 */
export function EditorPane({ className, selectedElementId, slide }: EditorPaneProps): ReactElement {
  return (
    <section
      className={cn('flex h-full flex-col justify-center overflow-auto bg-muted p-4', className)}
      aria-label="Editor"
    >
      {slide !== undefined && (
        <div className="relative">
          <SlideView className="shadow-md" svg={slide.svg} />
          <ElementOverlay
            className="absolute inset-0 h-full w-full"
            scene={slide.scene}
            selectedElementId={selectedElementId}
          />
        </div>
      )}
    </section>
  );
}
