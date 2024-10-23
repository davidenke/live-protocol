import { resolve } from 'node:path';

import autoprefixer from 'autoprefixer';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// Vite configuration
// https://vitejs.dev/config/
//
// Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
// https://tauri.app/start/frontend/vite/#update-vite-configuration
export default defineConfig(async () => ({
  // prevent vite from obscuring rust errors
  clearScreen: false,
  server: {
    port: 5173,
    // Tauri expects a fixed port, fail if that port is not available
    strictPort: true,
    // if the host Tauri is expecting is set, use it
    host: process.env.TAURI_DEV_HOST || false,
    hmr: process.env.TAURI_DEV_HOST
      ? {
          protocol: 'ws',
          host: process.env.TAURI_DEV_HOST,
          port: 5174,
        }
      : undefined,
    // 3. tell vite to ignore watching `src-tauri`
    watch: { ignored: ['**/src-tauri/**'] },
  },
  // to access the Tauri environment variables set by the CLI with information about the current target
  envPrefix: ['VITE_', 'TAURI_ENV_*'],
  build: {
    // Tauri uses Chromium on Windows and WebKit on macOS and Linux
    target: process.env.TAURI_ENV_PLATFORM === 'windows' ? 'chrome105' : 'safari13',
    // don't minify for debug builds
    minify: (!process.env.TAURI_ENV_DEBUG ? 'esbuild' : false) as unknown as boolean,
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
  },

  // add vendor prefixes to CSS automatically as needed
  css: { postcss: { plugins: [autoprefixer] } },

  plugins: [
    // add type check directly to vite
    checker({ typescript: true, overlay: false }),
    // that nasty docx converter uses node stuff
    nodePolyfills({ exclude: ['buffer', 'fs', 'http2', 'module', 'url', 'zlib'] }),
  ],
  define: {
    process: { env: {}, version: '0.0.0' },
    import: { meta: { url: '' } },
  },
  resolve: {
    alias: {
      buffer: resolve(import.meta.dirname, 'src/mocks/node/buffer.ts'),
      http2: resolve(import.meta.dirname, 'src/mocks/node/http2.ts'),
      module: resolve(import.meta.dirname, 'src/mocks/node/module.ts'),
      url: resolve(import.meta.dirname, 'src/mocks/node/url.ts'),
      zlib: resolve(import.meta.dirname, 'src/mocks/node/zlib.ts'),
    },
  },
}));
