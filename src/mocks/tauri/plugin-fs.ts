import type * as PluginFs from '@tauri-apps/plugin-fs';

import { getFileName } from '../../utils/file.utils.js';

// internal functionality for mocking - this is a poor mans adoption of a virtual
// file system in memory, to be able to read files from the file system
const __files = new Map<string, File>();

// every file to be read needs to be opened
// with a dialog, at that point we can access the file already; returning the file
// name as identifier, we pre-store it and make it available later for reading
export function __preStoreFile(file: File): string {
  // prepare unique identifier for the file
  const uuid = self.crypto.randomUUID() ?? +new Date();
  const id = `${uuid}/${file.name}`;

  // store the file and return the identifier
  __files.set(id, file);
  return id;
}

// the mock reads from the pre-stored files only
export const readFile: typeof PluginFs.readFile = async path => {
  console.info('tauri:', 'readFile', path);
  if (typeof path !== 'string' || !__files.has(path)) {
    return Promise.reject(`File not found: ${path}`);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onabort = () => reject('aborted');
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const buffer = reader.result as ArrayBuffer;
      resolve(new Uint8Array(buffer));
    };
    reader.readAsArrayBuffer(__files.get(path)!);
  });
};

// that can not be mocked unfortunately, as it' only drafted right ow
// File System Access: https://wicg.github.io/file-system-access/
// File System Observer: https://github.com/whatwg/fs/blob/main/proposals/FileSystemObserver.md
export const watchImmediate: typeof PluginFs.watchImmediate = async path => {
  console.info('tauri:', 'watchImmediate', path);
  return () => {};
};

// force a download of a file, by creating an anchor element in the browser;
// the previous save dialog just passed the desired file name to this
export const writeFile: typeof PluginFs.writeFile = async (path, data) => {
  console.info('tauri:', 'writeFile', path);
  const mimeTypes: Record<string, string> = {
    '.md': 'text/markdown',
    '.html': 'text/html',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  };
  const { extension } = getFileName(path.toString());
  const type = mimeTypes[extension] ?? 'application/octet-stream';
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = path.toString();
  link.click();
};
