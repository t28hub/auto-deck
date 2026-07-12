import type { SvgSlide } from '@auto-deck/renderer-svg';
import { PanelLeft } from 'lucide-react';
import { type ReactElement, useDeferredValue, useMemo, useState } from 'react';
import { usePanelRef } from 'react-resizable-panels';
import { Button } from '@/components/ui/button';
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
 * diagnostics in three resizable columns; the navigator column also opens
 * and closes from the header button.
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

  // The navigator column is both draggable and collapsible: the toggle button
  // drives the panel's imperative handle, and onResize keeps the button state
  // in sync when the column is dragged shut instead.
  const navigatorRef = usePanelRef();
  const [navigatorOpen, setNavigatorOpen] = useState(true);

  function toggleNavigator(): void {
    const navigator = navigatorRef.current;
    if (navigator === null) {
      return;
    }

    if (navigatorOpen) {
      navigator.collapse();
    } else {
      navigator.expand();
    }
  }

  return (
    <main className="flex h-full min-w-225 flex-col p-4">
      <header className="pb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleNavigator}
          aria-expanded={navigatorOpen}
          aria-label="Toggle navigator"
        >
          <PanelLeft className="stroke-1" />
        </Button>
      </header>

      <div className="min-h-0 flex-1">
        <ResizablePanelGroup animated className="gap-4">
          <ResizablePanel
            panelRef={navigatorRef}
            collapsible
            defaultSize="240px"
            minSize="200px"
            maxSize="320px"
            onResize={(size) => setNavigatorOpen(size.inPixels > 0)}
          >
            <textarea
              className={cn(frameClass, 'block h-full w-full resize-none border-zinc-300 font-mono')}
              value={source}
              onChange={(event) => setSource(event.target.value)}
              spellCheck={false}
              aria-label="Deck JSON"
            />
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel minSize="400px">
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
      </div>
    </main>
  );
}
