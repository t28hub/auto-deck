import { Tabs, TabsContent, TabsList, TabsTrigger } from '@auto-deck/ui/components/tabs';
import { cn } from '@auto-deck/ui/lib/utils';
import type { ReactElement } from 'react';

/**
 * Props for the InspectorPane component.
 */
interface InspectorPaneProps {
  /**
   * Extra classes merged onto the host element.
   */
  readonly className?: string;
}

/**
 * The inspector with tabs for the selected element's style, text, and layout.
 *
 * @param props - The props for the InspectorPane component.
 * @returns The inspector region.
 */
export function InspectorPane({ className }: InspectorPaneProps): ReactElement {
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

        <TabsContent value="layout" className="pt-1.5 text-muted-foreground">
          The layout controls will appear here.
        </TabsContent>

        <TabsContent value="ai" className="min-h-0 flex-1 pt-1.5">
          The AI controls will appear here.
        </TabsContent>
      </Tabs>
    </section>
  );
}
