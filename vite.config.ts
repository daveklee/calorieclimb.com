import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    // Esbuild vulnerability exists in the dev server only, so let's lock it down
    // to only be accessible on the local machine
    host: '127.0.0.1',
  }
});
