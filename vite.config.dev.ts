import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Development config - uses root path
export default defineConfig({
  plugins: [react()],
  base: '/',
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
}); 