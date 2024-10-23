export function fileURLToPath(url: string): string {
  return new URL(url).pathname;
}

export default { fileURLToPath };
