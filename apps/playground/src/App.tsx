import type { Deck } from '@auto-deck/schema';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@auto-deck/ui/components/resizable';
import { type ReactElement, useEffect, useMemo, useState } from 'react';
import { usePanelRef } from 'react-resizable-panels';
import { EditorPane } from '@/components/editor/editor-pane';
import { InspectorPane } from '@/components/inspector/inspector-pane';
import { NavigatorPane } from '@/components/navigator/navigator-pane';
import { Toolbar } from '@/components/toolbar';
import { deckRepository, INITIAL_DECK_ID } from '@/repository';
import { compile } from './compile';
import { useDocumentStore } from './stores/document';

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
 * The playground editor placing the navigator, the editor, and the inspector
 * in three resizable columns.
 *
 * @param deck - The deck being edited.
 */
function DeckEditor({ deck }: { deck: Deck }): ReactElement {
  const selectedSlideId = useDocumentStore((state) => state.selectedSlideId);
  const selectedElementId = useDocumentStore((state) => state.selectedElementId);

  const result = useMemo(() => compile(deck), [deck]);
  const slides = result.success ? result.slides : [];

  // The slide the editor shows: the selection while it exists, else the
  // first slide, which covers the initial state and a selection that was
  // edited out of the deck.
  const selectedSlide = slides.find((slide) => slide.scene.id === selectedSlideId) ?? slides.at(0);

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
    <main className="flex h-full min-w-225 flex-col">
      <Toolbar navigatorOpen={navigatorOpen} onToggleNavigator={toggleNavigator} className="flex-none" />

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
            {/* min-w-50 equals the panel's 200px minSize, keeping the content width fixed while the panel collapses. */}
            <div className="h-full min-w-50">
              <NavigatorPane deck={deck} slides={slides} selectedSlideId={selectedSlide?.scene.id} />
            </div>
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel minSize="400px">
            <EditorPane slide={selectedSlide} selectedElementId={selectedElementId} />
          </ResizablePanel>

          <ResizableHandle />

          <ResizablePanel defaultSize="280px" minSize="240px" maxSize="360px">
            <InspectorPane scene={selectedSlide?.scene} selectedElementId={selectedElementId} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </main>
  );
}
