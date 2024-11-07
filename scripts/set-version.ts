// pnpm dlx tsx scripts/set-version.ts
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

import glob from 'fast-glob';

import pkg from '../package.json' assert { type: 'json' };
import { getFileName } from '../src/utils/file.utils.js';

// just call `npm run set:version` to use the package version
// or `npm run set:version <version>` to use a custom version
const { positionals } = parseArgs({ allowPositionals: true });
const version = positionals[0] ?? pkg.version;

// prepare version banner
const intro = '// set live protocol version globally';
const banner = `${intro}
let lp = 'live-protocol';
if (!window.enke) window.enke = {};
if (!window.enke[lp]) window.enke[lp] = {};
if (window.enke[lp].version) {
  console.warn(\`> \${lp} ${version}: Another version (\${window.enke[lp].version}) has already been loaded.\`);
} else window.enke[lp].version = '${version}';
`;

// prepend version banner to given bundle
async function prependVersion(path: string) {
  const { name: file } = getFileName(path);
  const content = await readFile(path, 'utf8');

  // update dist file by adding banner if not already present
  if (!content.startsWith(intro)) {
    console.info(`> Updating ${file} with version banner ${version}`);
    await writeFile(path, banner + content);
  } else {
    console.info(`> Version banner already present in ${file}`);
  }
}

// replace version placeholders in given file
async function replaceVersion(path: string, placeholder = '##VERSION##') {
  const { name: file } = getFileName(path);
  const content = await readFile(path, 'utf8');

  // replace all occurrences of search string
  const pattern = new RegExp(placeholder, 'g');
  await writeFile(path, content.replace(pattern, version));
  console.info(`> Replaced version placeholders in ${file} with ${version}`);
}

async function invoke(pattern: string, fn: (path: string) => Promise<void>) {
  const cwd = fileURLToPath(new URL('..', import.meta.url));
  for await (const path of await glob(pattern, { onlyFiles: true, absolute: true, cwd })) {
    await fn(path);
  }
}

(async () => {
  await invoke('dist/assets/index-*.js', prependVersion);
  await invoke('dist/index.html', replaceVersion);
})();
