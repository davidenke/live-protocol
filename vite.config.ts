import { resolve } from 'node:path';

import autoprefixer from 'autoprefixer';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

import { version } from './package.json';

// Vite configuration
// https://vitejs.dev/config/
//
// Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
// https://tauri.app/start/frontend/vite/#update-vite-configuration
export default defineConfig(config => ({
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
    // prevent mixed results in output
    outDir: config.mode === 'detached' ? 'demo' : 'dist',
  },

  // add vendor prefixes to CSS automatically as needed
  css: { postcss: { plugins: [autoprefixer] } },

  // deploying the demo potentially on gh pages to a subfolder
  base: config.mode === 'detached' ? './' : '/',

  // we need some mocks for detached mode
  publicDir: config.mode === 'detached' ? 'mocks' : 'public',

  plugins: [
    // add type check directly to vite
    checker({ typescript: true, overlay: false }),
    // html-to-docx imports node modules, which are not available in the browser
    nodePolyfills(),
  ],
  define: {
    global: 'window',
    process: { env: { version }, version },
    import: { meta: { url: 'http://localhost' } },
  },
  resolve: {
    alias:
      config.mode === 'detached'
        ? {
            '@tauri-apps/api/window': resolve(import.meta.dirname, 'src/mocks/tauri/api.window.ts'),
            '@tauri-apps/api/event': resolve(import.meta.dirname, 'src/mocks/tauri/api.event.ts'),
            '@tauri-apps/plugin-dialog': resolve(
              import.meta.dirname,
              'src/mocks/tauri/plugin-dialog.ts'
            ),
            '@tauri-apps/plugin-fs': resolve(import.meta.dirname, 'src/mocks/tauri/plugin-fs.ts'),
          }
        : [],
  },
}));
