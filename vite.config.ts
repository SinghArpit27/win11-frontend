import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

/**
 * Vite is configured to mirror the path aliases in `tsconfig.app.json`.
 *
 * `import.meta.env.VITE_*` variables are loaded via `loadEnv` so the dev
 * server only forwards what we explicitly opt-in to (avoid leaking secrets
 * through HMR).
 */
export default defineConfig(({ mode }) => {
  loadEnv(mode, process.cwd(), 'VITE_');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@app': path.resolve(__dirname, './src/app'),
        '@components': path.resolve(__dirname, './src/components'),
        '@config': path.resolve(__dirname, './src/config'),
        '@constants': path.resolve(__dirname, './src/constants'),
        '@features': path.resolve(__dirname, './src/features'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@router': path.resolve(__dirname, './src/router'),
        '@services': path.resolve(__dirname, './src/services'),
        '@store': path.resolve(__dirname, './src/store'),
        '@theme': path.resolve(__dirname, './src/theme'),
        '@types': path.resolve(__dirname, './src/types'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@shared': path.resolve(__dirname, './shared'),
      },
    },
    server: {
      host: true,
      port: 5173,
      strictPort: false,
    },
    preview: {
      host: true,
      port: 4173,
    },
    build: {
      target: 'es2022',
      sourcemap: mode !== 'production',
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            redux: ['@reduxjs/toolkit', 'react-redux'],
            motion: ['framer-motion'],
          },
        },
      },
    },
  };
});
