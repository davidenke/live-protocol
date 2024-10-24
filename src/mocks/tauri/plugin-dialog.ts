import type * as PluginDialog from '@tauri-apps/plugin-dialog';

import { __preStoreFile } from './plugin-fs.js';

// use a native file dialog to open a file, by creating an input element
// in the browser and simulating a click on it
export const open: typeof PluginDialog.open<PluginDialog.OpenDialogOptions> = async ({ filters } = {}) => {
  const extensions = filters?.flatMap(({ extensions }) => extensions);
  const input = document.createElement('input');
  input.accept = extensions?.map(ext => `.${ext}`).join(',') ?? '*';
  input.type = 'file';

  const path = await new Promise<string | null>(resolve => {
    input.oncancel = (event: Event) => {
      event.preventDefault();
      resolve(null);
    };
    input.onchange = (event: Event) => {
      event.preventDefault();
      if (!input.files?.length) return resolve(null);
      const [file] = input.files;
      resolve(__preStoreFile(file));
    };
    input.click();
  });

  console.info('tauri:', 'open', path);
  return path;
};

// in mock world, the file save will do this job, so just go on by passing
// the desired file name to the subsequent file write operation
export const save: typeof PluginDialog.save = async ({ defaultPath } = {}) => {
  console.info('tauri:', 'save', defaultPath);
  return defaultPath ?? null;
};
