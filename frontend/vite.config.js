import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  // Load environment variables based on the current mode (e.g., development)
  const env = loadEnv(mode, process.cwd());

  // Default to localhost:8000 if VITE_BACKEND_URL isn't provided
  const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:8000';

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      host: true,
      port: 3000,
      proxy: {
        '/chat': {
          target: backendUrl,
          changeOrigin: true,
          ws: true,
        },
        '/stream': {
          target: backendUrl,
          changeOrigin: true,
          ws: true,
        },
      },
    },
  };
});
