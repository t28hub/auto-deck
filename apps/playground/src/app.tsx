import { type ReactElement, useDeferredValue, useMemo, useState } from 'react';
import { compile } from './compile';
import { SAMPLE_DECK } from './sample';

/**
 * The playground: a deck JSON editor on the left, the rendered slides (or the
 * failure message) on the right, recompiled on every edit.
 */
export function App(): ReactElement {
  const [source, setSource] = useState(SAMPLE_DECK);
  // Deferring keeps keystrokes responsive: the urgent render re-renders with
  // the previous deferred source, where the memo hits, and the compile runs
  // once at low priority when typing pauses.
  const deferredSource = useDeferredValue(source);
  const result = useMemo(() => compile(deferredSource), [deferredSource]);

  return (
    <main className="playground">
      <textarea
        className="editor"
        value={source}
        onChange={(event) => setSource(event.target.value)}
        spellCheck={false}
        aria-label="Deck JSON"
      />
      <section className="preview">
        {result.success ? (
          result.slides.map((slide) => (
            <figure key={slide.slideId} className="slide">
              <div dangerouslySetInnerHTML={{ __html: slide.svg }} />
              <figcaption>{slide.slideId}</figcaption>
            </figure>
          ))
        ) : (
          <pre className="error">{result.message}</pre>
        )}
      </section>
    </main>
  );
}
