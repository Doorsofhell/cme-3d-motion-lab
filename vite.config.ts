import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'pages' ? '/cme-3d-motion-lab/' : '/',
  build: { outDir: 'dist', sourcemap: false },
  server: { port: 4175 },
}));
