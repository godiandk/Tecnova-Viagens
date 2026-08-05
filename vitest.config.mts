import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Resolve o alias "@/..." lendo os paths do tsconfig.json.
  resolve: { tsconfigPaths: true },
  test: {
    environment: 'node',
    include: ['testes/**/*.teste.ts'],
  },
});
