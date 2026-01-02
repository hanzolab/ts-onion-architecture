import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      lib: path.resolve(__dirname, './lib'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
      'tests/integration/**/*.{test,spec}.{ts,tsx}',
    ],
    globalSetup: ['./tests/integration/global-setup.ts'],
    setupFiles: ['./tests/integration/setup.ts'],
    hookTimeout: 600000, // Testcontainerの起動に初回は時間がかかる可能性があるため
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/*.test.ts', '**/*.spec.ts', '**/node_modules/**'],
    },
  },
});
