import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'pages' ? '/cme-3d-motion-lab/' : '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
    // three.js alone is ~740 kB minified; it is cached separately from the app.
    chunkSizeWarningLimit: 800,
    rolldownOptions: {
      output: {
        // Libraries change far less often than the app: separate chunks stay cached across releases.
        codeSplitting: {
          groups: [
            { name: 'three', test: /node_modules[\\/]three[\\/]/ },
            { name: 'react-three', test: /node_modules[\\/](@react-three|three-stdlib|@monogrid|camera-controls|maath|troika|zustand|suspend-react|its-fine)/ },
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
          ],
        },
      },
    },
  },
  server: { port: 4175 },
}));
