import type { SvgSlide } from '@auto-deck/renderer-svg';
import { type ReactElement, useDeferredValue, useMemo, useState } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { cn } from '@/lib/utils';
import { compile } from './compile';
import { SAMPLE_DECK } from './sample';

/**
 * The shared frame of the bordered panels (editor and error box), so a
 * radius, border, or type-size restyle happens in one place.
 */
const frameClass = 'rounded-lg border p-3 text-[13px]';

/**
 * The playground: a deck JSON editor, the rendered slides, and the compile
 * diagnostics in three resizable columns.
 */
export function App(): ReactElement {
  const [source, setSource] = useState(SAMPLE_DECK);
  // Deferring keeps keystrokes responsive: the urgent render re-renders with
  // the previous deferred source, where the memo hits, and the compile runs
  // once at low priority when typing pauses.
  const deferredSource = useDeferredValue(source);
  const result = useMemo(() => compile(deferredSource), [deferredSource]);

  // Keep the last successful slides so the preview survives the invalid
  // intermediate states while typing; failures surface in the diagnostics
  // column instead.
  const [slides, setSlides] = useState<readonly SvgSlide[]>([]);
  if (result.success && result.slides !== slides) {
    setSlides(result.slides);
  }

  return (
    <main className="h-full p-4">
      <ResizablePanelGroup className="gap-4">
        <ResizablePanel defaultSize="240px" minSize="200px" maxSize="320px">
          <textarea
            className={cn(frameClass, 'block size-full resize-none border-zinc-300 font-mono')}
            value={source}
            onChange={(event) => setSource(event.target.value)}
            spellCheck={false}
            aria-label="Deck JSON"
          />
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel>
          <section className="flex h-full flex-col gap-4 overflow-y-auto" aria-label="Slide preview">
            {slides.map((slide) => (
              <figure key={slide.slideId}>
                <div
                  className="[&>svg]:h-auto [&>svg]:w-full [&>svg]:rounded-lg [&>svg]:border [&>svg]:border-zinc-300 [&>svg]:bg-white [&>svg]:shadow-sm"
                  dangerouslySetInnerHTML={{ __html: slide.svg }}
                />
                <figcaption className="mt-1 text-xs text-zinc-500">{slide.slideId}</figcaption>
              </figure>
            ))}
          </section>
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize="280px" minSize="240px" maxSize="360px">
          <section className="h-full overflow-y-auto" aria-label="Diagnostics">
            {result.success ? (
              <p className="text-[13px] text-green-700">{result.slides.length} slide(s) rendered.</p>
            ) : (
              <pre className={cn(frameClass, 'whitespace-pre-wrap border-red-300 bg-red-50 text-red-700')}>
                {result.message}
              </pre>
            )}
          </section>
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
}
