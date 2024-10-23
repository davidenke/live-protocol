export async function readFile(path: string): Promise<Uint8Array> {
  const extension = path.slice(path.lastIndexOf('.') + 1);
  console.info('tauri:', 'readFile', path);
  switch (extension) {
    case 'xmind': {
      const response = await fetch('/business-plan.xmind');
      return new Uint8Array(await response.arrayBuffer());
    }
    default:
      return Buffer.from([]);
  }
}

export async function watchImmediate(path: string) {
  console.info('tauri:', 'watchImmediate', path);
}

export async function writeFile(path: string) {
  console.info('tauri:', 'writeFile', path);
}
