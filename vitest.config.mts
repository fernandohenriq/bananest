import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 30000, // 30 seconds
    include: ['src/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules', 'dist', 'build'],
  },
});
