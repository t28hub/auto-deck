import type { ReactElement } from 'react';
import { cn } from '@/lib/utils';

/**
 * Props for the SlideView component.
 */
interface SlideViewProps {
  /**
   * The slide's SVG document string.
   */
  readonly svg: string;

  /**
   * Extra classes merged onto the host element.
   */
  readonly className?: string;
}

/**
 * Hosts one rendered slide by injecting its standalone SVG document.
 * Shiki, KaTeX, and Mermaid host their rendered markup the same way in React.
 *
 * @param props - The props for the SlideView component.
 * @returns The element hosting the slide.
 */
export function SlideView({ svg, className }: SlideViewProps): ReactElement {
  return (
    <div
      className={cn('border border-border bg-white [&>svg]:block [&>svg]:h-auto [&>svg]:w-full', className)}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
