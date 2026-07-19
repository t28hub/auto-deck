import { coverageConfigDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    execArgv: ['--no-experimental-webstorage'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**'],
      // The shadcn/ui components are generated and stay untested; extend this list when the shadcn CLI adds files.
      exclude: [
        ...coverageConfigDefaults.exclude,
        'src/components/button.tsx',
        'src/components/input.tsx',
        'src/components/resizable.tsx',
        'src/components/tabs.tsx',
        'src/lib/utils.ts',
      ],
    },
  },
});
