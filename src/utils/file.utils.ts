import type { WatchEvent } from '@tauri-apps/plugin-fs';
import { readFile, watchImmediate, writeFile } from '@tauri-apps/plugin-fs';

export function isWatchedFileDataModified(event: WatchEvent): boolean {
  return (
    typeof event === 'object' &&
    typeof event.type === 'object' &&
    'modify' in event.type &&
    event.type.modify.kind === 'data'
  );
}

export async function readAndWatchFile(
  path: string,
  onData: (data: Uint8Array) => void
): Promise<() => void> {
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

export interface FileName {
  name: string;
  base: string;
  extension: string;
}
export function getFileName(path: string, suffix?: string): FileName {
  const lastIndex = (of: string[]) => new RegExp(`[${of.join('|')}](?=[^|${of.join('|')}]*$)`);
  const returnEmpty = () => ({ name: '', base: '', extension: '' });

  // handle empty or blank paths
  if (path.trim() === '') {
    return returnEmpty();
  }

  // extract name from path
  const nameIndex = path.search(lastIndex(['\\\\', '/']));
  const nameOffset = 1; // a single slash or backslash
  const name = path.slice(nameIndex >= 0 ? nameIndex + nameOffset : 0);

  // handle paths without a name (ending with slash or backslash)
  if (nameIndex === path.length - nameOffset) {
    returnEmpty();
  }

  // extract extension and base name
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

  // return file info
  return { name, base, extension };
}

export async function exportFile(path: string, data: string | Uint8Array): Promise<void> {
  // convert string contents to Uint8Array if necessary
  if (typeof data === 'string') {
    data = new TextEncoder().encode(data);
  }
  // write to file
  return writeFile(path, data);
}
