import type { ReactElement } from 'react';
import type { CompileResult } from '@/compile';

/**
 * Props for the InspectorPane component.
 */
interface InspectorPaneProps {
  /**
   * The compile result to report.
   */
  readonly result: CompileResult;
}

/**
 * The inspector for the styles, text, and layout of the selected element.
 * It provisionally shows the compile result until those tools land.
 *
 * @param props - The props for the InspectorPane component.
 * @returns The inspector region.
 */
export function InspectorPane({ result }: InspectorPaneProps): ReactElement {
  return (
    <section className="h-full overflow-y-auto" aria-label="Inspector">
      {result.success ? (
        <p className="text-[13px] text-green-700 dark:text-green-400">{result.slides.length} slide(s) rendered.</p>
      ) : (
        <pre className="whitespace-pre-wrap bg-destructive/10 text-destructive">{result.message}</pre>
      )}
    </section>
  );
}
