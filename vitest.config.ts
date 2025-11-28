import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/',
        'dist/',
        '.next/',
        'design-system/**',
        'server/**',
        'components/cyberpunk/**',
        'components/ExportView.tsx',
        'components/HistoryView.tsx',
        'components/ErrorBoundary.tsx',
        'components/ui/**',
        'index.tsx',
        'App.tsx',
      ],
      thresholds: {
        lines: 80,
        functions: 55,
        branches: 75,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
