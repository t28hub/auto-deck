import type { Deck } from '@auto-deck/schema';
import { Moon, PanelLeft, Sun } from 'lucide-react';
import { type ReactElement, useEffect, useMemo, useState } from 'react';
import { usePanelRef } from 'react-resizable-panels';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { deckRepository, INITIAL_DECK_ID } from '@/repository';
import { compile } from './compile';
import { useDocumentStore } from './stores/document';

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
 * Loads the initial deck through the repository into the document store, and
 * shows the editor once it is there.
 */
export function App(): ReactElement {
  const deck = useDocumentStore((state) => state.deck);
  const hydrate = useDocumentStore((state) => state.hydrate);

  useEffect(() => {
    void deckRepository.load(INITIAL_DECK_ID).then((loaded) => {
      if (loaded === null) {
        console.error(`Deck ${INITIAL_DECK_ID} is not in the repository.`);
        return;
      }
      hydrate(loaded);
    });
  }, [hydrate]);

  if (deck === null) {
    return (
      <main className="flex h-full items-center justify-center text-muted-foreground" aria-busy>
        Loading deck…
      </main>
    );
  }

  return <DeckEditor deck={deck} />;
}

/**
 * The playground editor: a tabbed navigator (slides, outline, and the deck
 * JSON view), the rendered slides, and the compile diagnostics in three
 * resizable columns; the navigator column also opens and closes from the
 * header button.
 *
 * @param deck - The deck being edited.
 */
function DeckEditor({ deck }: { deck: Deck }): ReactElement {
  const selectedSlideId = useDocumentStore((state) => state.selectedSlideId);
  const selectSlide = useDocumentStore((state) => state.selectSlide);

  const result = useMemo(() => compile(deck), [deck]);
  const slides = result.success ? result.slides : [];
  const deckJson = useMemo(() => JSON.stringify(deck, null, 2), [deck]);

  // The slide the preview shows: the selection while it exists, else the
  // first slide, which covers the initial state and a selection that was
  // edited out of the deck.
  const selectedSlide = slides.find((slide) => slide.slideId === selectedSlideId) ?? slides.at(0);

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
        <ResizablePanelGroup animated>
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
                <TabsTrigger value="slides" className="text-xs">
                  Slides
                </TabsTrigger>
                <TabsTrigger value="outline" className="text-xs">
                  Outline
                </TabsTrigger>
                <TabsTrigger value="json" className="text-xs">
                  JSON
                </TabsTrigger>
              </TabsList>

              <TabsContent value="slides" className="min-h-0 overflow-y-auto pt-1.5">
                <ol className="flex flex-col gap-3" aria-label="Slide list">
                  {slides.map((slide, index) => {
                    const isSelected = slide.slideId === selectedSlide?.slideId;
                    return (
                      <li key={slide.slideId} className="flex items-start gap-2">
                        <span className="w-3.5 pt-0.5 text-right font-mono text-xs text-muted-foreground">
                          {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => selectSlide(slide.slideId)}
                          aria-current={isSelected}
                          aria-label={`Select slide ${index + 1}`}
                          className="min-w-0 flex-1 cursor-pointer rounded-md focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring"
                        >
                          <SlideCanvas
                            svg={slide.svg}
                            className={cn(
                              '[&>svg]:rounded-md',
                              isSelected && '[&>svg]:border-primary [&>svg]:ring-2 [&>svg]:ring-primary/40',
                            )}
                          />
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </TabsContent>

              <TabsContent value="outline" className="pt-1.5 text-muted-foreground">
                The deck outline will appear here.
              </TabsContent>

              <TabsContent value="json" className="min-h-0 overflow-auto pt-1.5">
                <pre className="font-mono text-xs">{deckJson}</pre>
              </TabsContent>
            </Tabs>
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel minSize="400px" className="flex items-center">
            <section className="p-4 overflow-auto" aria-label="Slide preview">
              {selectedSlide !== undefined && <SlideCanvas svg={selectedSlide.svg} />}
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
