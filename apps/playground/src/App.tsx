import type { SvgSlide } from '@auto-deck/renderer-svg';
import { Moon, PanelLeft, Sun } from 'lucide-react';
import { type ReactElement, useDeferredValue, useMemo, useState } from 'react';
import { usePanelRef } from 'react-resizable-panels';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { compile } from './compile';
import { SAMPLE_DECK } from './sample';

/**
 * Hosts one rendered slide by injecting its standalone SVG document; the
 * viewBox lets CSS scale it to the container width. The canvas stays white in
 * both themes: it is document content, not UI.
 *
 * @param svg - The slide's SVG document string.
 * @param className - Extra classes merged onto the host element.
 */
function SlideCanvas({ svg, className }: { svg: string; className?: string }): ReactElement {
  return (
    <div
      className={cn('[&>svg]:h-auto [&>svg]:w-full [&>svg]:border [&>svg]:border-border [&>svg]:bg-white', className)}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

/**
 * The playground: a tabbed navigator (slides, outline, and the deck JSON
 * editor), the rendered slides, and the compile diagnostics in three
 * resizable columns; the navigator column also opens and closes from the
 * header button.
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

  const { resolvedTheme, setTheme } = useTheme();

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
    <main className="flex h-full min-w-225 flex-col">
      <header className="flex items-center justify-between pb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleNavigator}
          aria-expanded={navigatorOpen}
          aria-label="Toggle navigator"
        >
          <PanelLeft className="stroke-1" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          {resolvedTheme === 'dark' ? <Sun className="stroke-1" /> : <Moon className="stroke-1" />}
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
            <Tabs defaultValue="slides" className="h-full min-w-50 px-3 pb-3">
              <TabsList className="w-full py-1">
                <TabsTrigger value="slides">Slides</TabsTrigger>
                <TabsTrigger value="outline">Outline</TabsTrigger>
                <TabsTrigger value="json">JSON</TabsTrigger>
              </TabsList>

              <TabsContent value="slides" className="min-h-0 overflow-y-auto pt-1.5">
                <ol className="flex flex-col gap-3" aria-label="Slide list">
                  {slides.map((slide, index) => (
                    <li key={slide.slideId} className="flex items-start gap-2">
                      <span className="w-3.5 pt-0.5 text-right font-mono text-xs text-muted-foreground">
                        {index + 1}
                      </span>
                      <SlideCanvas svg={slide.svg} className="min-w-0 flex-1 [&>svg]:rounded-md" />
                    </li>
                  ))}
                </ol>
              </TabsContent>

              <TabsContent value="outline" className="pt-1.5 text-muted-foreground">
                The deck outline will appear here.
              </TabsContent>

              <TabsContent value="json" className="pt-1.5">
                <textarea
                  className="block h-full w-full min-w-80 resize-none font-mono text-sm"
                  value={source}
                  onChange={(event) => setSource(event.target.value)}
                  spellCheck={false}
                  aria-label="Deck JSON"
                />
              </TabsContent>
            </Tabs>
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel minSize="400px">
            <section className="flex h-full flex-col gap-4 overflow-y-auto" aria-label="Slide preview">
              {slides.map((slide) => (
                <figure key={slide.slideId}>
                  <SlideCanvas svg={slide.svg} className="[&>svg]:rounded-lg [&>svg]:shadow-sm" />
                  <figcaption className="mt-1 text-xs text-muted-foreground">{slide.slideId}</figcaption>
                </figure>
              ))}
            </section>
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel defaultSize="280px" minSize="240px" maxSize="360px">
            <section className="h-full overflow-y-auto" aria-label="Diagnostics">
              {result.success ? (
                <p className="text-[13px] text-green-700 dark:text-green-400">
                  {result.slides.length} slide(s) rendered.
                </p>
              ) : (
                <pre className="whitespace-pre-wrap bg-destructive/10 text-destructive">{result.message}</pre>
              )}
            </section>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </main>
  );
}
