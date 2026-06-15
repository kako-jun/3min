import { defineConfig } from 'vitest/config'

// Standalone Vitest config (no Vite PWA/React plugins needed for the pure
// calendar logic under src/lib). Node environment — no DOM, no Konva.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
