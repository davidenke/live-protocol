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

export type FileName = { name: string; base: string; extension: string };
export function getFileName(path: string, suffix?: string): FileName {
  const lastIndex = (of: string[]) => new RegExp(`[${of.join('|')}](?:.(?![${of.join('|')}]))+$`);

  const nameIndex = path.search(lastIndex(['\\\\', '/']));
  const nameOffset = 1; // a single slash or backslash
  const name = path.slice(nameIndex >= 0 ? nameIndex + nameOffset : path.length);

  let base: string, extension: string;
  if (suffix !== undefined) {
    const expression = new RegExp(`${suffix.replace('.', '\\.')}$`);
    const hasSuffix = expression.test(name);
    base = hasSuffix ? name.replace(expression, '') : name;
    extension = hasSuffix ? suffix : '';
  } else {
    const extIndex = name.lastIndexOf('.');
    base = name.slice(0, extIndex >= 0 ? extIndex : name.length);
    extension = name.slice(extIndex >= 0 ? extIndex : name.length);
  }

  return { name, base, extension };
}
}
