import { assert } from 'vitest';

/**
 * Parses the given SVG markup into a DOM element, asserting that it is well-formed.
 *
 * @param markup - The SVG markup to parse.
 * @returns The root element of the parsed SVG document.
 */
export function parseSvg(markup: string): Element {
  const parsed = new DOMParser().parseFromString(markup, 'image/svg+xml');

  // The `XMLDocument` returned by `parseFromString` will contain a `<parsererror>` element if the markup is not well-formed XML.
  // https://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString
  const errorNode = parsed.querySelector('parsererror');
  assert(errorNode === null, 'Expected rendered markup to be well-formed XML');

  return parsed.documentElement;
}
