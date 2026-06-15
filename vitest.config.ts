import { defineConfig } from 'vitest/config'

// Standalone Vitest config (no Vite PWA/React plugins needed for the pure
// calendar logic under src/lib). Node environment — no DOM, no Konva.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // 祝日/暦テストはローカル深夜基準の Date を使うため、正の UTC オフセット
    // 地域（豪/NZ 等）で実行すると date-holidays の判定がずれて落ちる。
    // TZ を UTC に固定して、どの開発者環境でも決定的に通るようにする。
    env: { TZ: 'UTC' },
  },
})
