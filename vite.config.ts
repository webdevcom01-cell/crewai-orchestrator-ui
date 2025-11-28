import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // Backend URL for secure API proxy
        // API keys are now only on backend - frontend never sees them
        'import.meta.env.VITE_BACKEND_URL': JSON.stringify(
          env.VITE_BACKEND_URL || 'http://localhost:8000/api'
        )
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
