import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'happy-dom',
      // Node's built-in experimental localStorage would shadow happy-dom's,
      // breaking storage tests; disable it.
      execArgv: ['--no-experimental-webstorage'],
      coverage: {
        provider: 'v8',
        include: ['src/**'],
        reporter: ['text', 'html', 'lcov'],
      },
    },
  }),
);
