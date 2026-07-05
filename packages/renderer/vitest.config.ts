import { defineConfig } from 'vitest/config';

/**
 * Required even though it looks like defaults: without a local config, Vitest
 * walks up to the repo config, whose `projects` globs do not resolve from a
 * package directory, and `test:coverage` fails with "No projects were found".
 */
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      reporter: ['text', 'html', 'lcov'],
    },
  },
});
