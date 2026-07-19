import { coverageConfigDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: ['packages/*', 'apps/*'],
    coverage: {
      provider: 'v8',
      include: ['packages/*/src/**', 'apps/*/src/**'],
      // The shadcn-generated sources stay untested and out of coverage;
      // keep this list in sync with packages/ui/vitest.config.ts.
      exclude: [
        ...coverageConfigDefaults.exclude,
        'packages/ui/src/components/button.tsx',
        'packages/ui/src/components/input.tsx',
        'packages/ui/src/components/resizable.tsx',
        'packages/ui/src/components/tabs.tsx',
        'packages/ui/src/lib/utils.ts',
      ],
      reporter: ['text', 'html', 'lcov'],
    },
  },
});
