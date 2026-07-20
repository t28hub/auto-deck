import type { Scene } from '@auto-deck/renderer';
import type { ElementId } from '@auto-deck/schema';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@auto-deck/ui/components/tabs';
import { cn } from '@auto-deck/ui/lib/utils';
import type { ReactElement } from 'react';
import { LayoutTab } from '@/components/inspector/layout-tab';

/**
 * Props for the InspectorPane component.
 */
interface InspectorPaneProps {
  /**
   * Extra classes merged onto the host element.
   */
  readonly className?: string;

  /**
   * The scene of the slide being edited, or undefined when the deck has no slides.
   */
  readonly scene: Scene | undefined;

  /**
   * The identifier of the element highlighted as selected.
   */
  readonly selectedElementId: ElementId | null;
}

/**
 * The inspector with tabs for the selected element's style, text, and layout.
 *
 * @param props - The props for the InspectorPane component.
 * @returns The inspector region.
 */
export function InspectorPane({ className, scene, selectedElementId }: InspectorPaneProps): ReactElement {
  return (
    <section className={cn('flex h-full flex-col', className)} aria-label="Inspector">
      <Tabs defaultValue="ai" className="min-h-0 flex-1 px-3 py-2">
        <TabsList className="w-full">
          <TabsTrigger value="style" className="text-xs">
            Style
          </TabsTrigger>
          <TabsTrigger value="text" className="text-xs">
            Text
          </TabsTrigger>
          <TabsTrigger value="layout" className="text-xs">
            Layout
          </TabsTrigger>
          <TabsTrigger value="ai" className="text-xs">
            AI
          </TabsTrigger>
        </TabsList>

        <TabsContent value="style" className="pt-1.5 text-muted-foreground">
          The style controls will appear here.
        </TabsContent>

        <TabsContent value="text" className="pt-1.5 text-muted-foreground">
          The text controls will appear here.
        </TabsContent>

        <TabsContent value="layout" className="pt-1.5">
          <LayoutTab scene={scene} selectedElementId={selectedElementId} />
        </TabsContent>

        <TabsContent value="ai" className="min-h-0 flex-1 pt-1.5">
          The AI controls will appear here.
        </TabsContent>
      </Tabs>
    </section>
  );
}
