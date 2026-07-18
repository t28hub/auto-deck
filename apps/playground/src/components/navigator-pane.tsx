import type { Deck, SlideId } from '@auto-deck/schema';
import { type ReactElement, useMemo } from 'react';
import type { CompiledSlide } from '@/compile';
import { SlideView } from '@/components/slide-view';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useDocumentStore } from '@/stores/document';

/**
 * Props for the NavigatorPane component.
 */
interface NavigatorPaneProps {
  /**
   * The deck being edited.
   */
  readonly deck: Deck;

  /**
   * The rendered slides listed in the slides tab.
   */
  readonly slides: readonly CompiledSlide[];

  /**
   * The identifier of the slide highlighted as selected.
   */
  readonly selectedSlideId: SlideId | undefined;
}

/**
 * The navigator with tabs for the slide thumbnails, the outline, and the deck JSON.
 *
 * @param props - The props for the NavigatorPane component.
 * @returns The tabbed navigator.
 */
export function NavigatorPane({ deck, slides, selectedSlideId }: NavigatorPaneProps): ReactElement {
  const selectSlide = useDocumentStore((state) => state.selectSlide);

  return (
    <Tabs defaultValue="slides" className="h-full px-3 py-2">
      <TabsList className="w-full">
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
        <ol className="flex flex-col gap-2.5" aria-label="Slide list">
          {slides.map((slide, index) => {
            const isSelected = slide.scene.id === selectedSlideId;
            return (
              <li key={slide.scene.id} className={cn('rounded-md transition-colors', isSelected && 'bg-accent')}>
                <button
                  type="button"
                  onClick={() => selectSlide(slide.scene.id)}
                  aria-current={isSelected ? true : undefined}
                  aria-label={`Select slide ${index + 1}`}
                  className="flex w-full cursor-pointer items-start gap-2 rounded-md p-1.5 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring"
                >
                  <span className="w-3.5 pt-0.5 text-right font-mono text-xs text-muted-foreground">{index + 1}</span>
                  <SlideView
                    className="min-w-0 flex-1 overflow-hidden rounded-sm border border-border"
                    svg={slide.svg}
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
        <DeckJson deck={deck} />
      </TabsContent>
    </Tabs>
  );
}

/**
 * Renders the deck as formatted JSON.
 * A separate component keeps the serialization off deck edits made while the
 * JSON tab is hidden, because inactive tab panels are unmounted.
 *
 * @param deck - The deck to serialize.
 * @returns The formatted JSON block.
 */
function DeckJson({ deck }: { readonly deck: Deck }): ReactElement {
  const deckJson = useMemo(() => JSON.stringify(deck, null, 2), [deck]);
  return <pre className="font-mono text-xs">{deckJson}</pre>;
}
