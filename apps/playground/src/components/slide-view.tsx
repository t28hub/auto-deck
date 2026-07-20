import { cn } from '@auto-deck/ui/lib/utils';
import type { ReactElement } from 'react';

/**
 * Props for the SlideView component.
 */
interface SlideViewProps {
  /**
   * Extra classes merged onto the host element.
   */
  readonly className?: string;

  /**
   * Whether content outside the slide bounds is clipped, as in exports, where
   * the clip lives in the SVG viewport itself. The editor disables this so
   * elements dragged off the slide stay visible on the surrounding canvas.
   */
  readonly clipped?: boolean;

  /**
   * The slide's SVG document string.
   */
  readonly svg: string;
}

/**
 * Hosts one rendered slide by injecting its standalone SVG document.
 * Shiki, KaTeX, and Mermaid host their rendered markup the same way in React.
 *
 * @param props - The props for the SlideView component.
 * @returns The element hosting the slide.
 */
export function SlideView({ className, clipped = true, svg }: SlideViewProps): ReactElement {
  return (
    <div
      className={cn(
        'bg-white [&>svg]:block [&>svg]:h-auto [&>svg]:w-full',
        !clipped && '[&>svg]:overflow-visible',
        className,
      )}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
