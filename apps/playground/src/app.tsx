import { type ReactElement, useState } from 'react';
import { compile } from './compile';
import { SAMPLE_DECK } from './sample';

/**
 * The playground: a deck JSON editor on the left, the rendered slides (or the
 * failure message) on the right, recompiled on every edit.
 */
export function App(): ReactElement {
  const [source, setSource] = useState(SAMPLE_DECK);
  // Every render is caused by a source change, so memoizing would never hit.
  const result = compile(source);

  return (
    <main className="playground">
      <section className="editor">
        <textarea
          value={source}
          onChange={(event) => setSource(event.target.value)}
          spellCheck={false}
          aria-label="Deck JSON"
        />
      </section>
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
