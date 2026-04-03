import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/auth':          'http://localhost:5001',
      '/users':         'http://localhost:5001',
      '/games':         'http://localhost:5001',
      '/plans':         'http://localhost:5001',
      '/subscriptions': 'http://localhost:5001',
      '/admin':         'http://localhost:5001',
      '/uploads':       'http://localhost:5001',
    },
  },
});
