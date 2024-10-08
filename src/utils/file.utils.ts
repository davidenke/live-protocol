import { readFile, type WatchEvent, watchImmediate } from '@tauri-apps/plugin-fs';

export function isWatchedFileDataModified(event: WatchEvent): boolean {
  return (
    typeof event === 'object' &&
    typeof event.type === 'object' &&
    'modify' in event.type &&
    event.type.modify.kind === 'data'
  );
}

export async function readAndWatchFile(path: string, onData: (data: Uint8Array) => void): Promise<() => void> {
  // read initially
  onData(await readFile(path));
  // watch for changes
  return watchImmediate(path, async event => {
    // check that data has been modified (not metadata, permissions, etc.)
    if (isWatchedFileDataModified(event)) {
      onData(await readFile(path));
    }
  });
}
