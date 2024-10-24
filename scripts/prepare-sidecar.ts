import { exec as _exec } from 'node:child_process';
import { existsSync } from 'node:fs';
import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { execPath, platform, version } from 'node:process';
import { parseArgs, promisify } from 'node:util';

import { inject } from 'postject';
import { build } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

const exec = promisify(_exec);
const isMac = platform === 'darwin';
const isWin = platform === 'win32';

// parse arguments
const { values } = parseArgs({ options: { from: { type: 'string' }, out: { type: 'string' } } });
if (!values.from) throw new Error('Missing required argument: --from');
if (!existsSync(values.from)) throw new Error(`File not found: ${values.from}`);

// prepare file base name and find output folder
const name = basename(values.from, '.ts');
const { out = resolve(import.meta.dirname, '../bin') } = values;

// clear output folder
if (existsSync(out)) await rm(out, { recursive: true });
await mkdir(out, { recursive: true });

// compile the TypeScript code with tsc
// const fromData = await readFile(values.from, 'utf-8');
// const { outputText } = transpileModule(fromData, {});
// await writeFile(resolve(out, `${name}.js`), outputText, 'utf-8');

// compile the TypeScript code with vite
const [{ output }] = (await build({
  build: {
    lib: { entry: values.from, formats: ['cjs'], fileName: name },
    minify: false, // we still need to clean up afterwards
    target: ['es2020', `node${version.replace(/^v(\d+)\..*$/, '$1')}`],
    write: false,
  },
  plugins: [nodePolyfills({ include: ['stream'] })],
})) as unknown as [{ output: [{ code: string; preliminaryFileName: string }] }];

// remove the nasty stuff
const [{ code, preliminaryFileName }] = output;
const cleaned = code.replace('require$1("../../package.json")', '{version: "0.0.0"}');
await writeFile(resolve(out, preliminaryFileName), cleaned);

// create sea.config.json
await writeFile(
  resolve(out, 'sea.config.json'),
  JSON.stringify({
    main: preliminaryFileName,
    output: `${name}.blob`,
    disableExperimentalSEAWarning: true,
  }),
);

// https://nodejs.org/docs/latest-v20.x/api/single-executable-applications.html#single-executable-applications
// generate the blob to be injected
await exec('node --experimental-sea-config sea.config.json', { cwd: out });

// create a copy of the node executable and name it accordingly
const bin = `${name}${isWin ? '.exe' : ''}`;
await copyFile(execPath, resolve(out, bin));

// remove the signature of the binary (macOS and Windows only)
if (isMac) await exec(`codesign --remove-signature ${bin}`, { cwd: out });
if (isWin) await exec(`signtool remove /s ${bin}`, { cwd: out });

// inject the blob into the copied binary
const data = await readFile(resolve(out, `${name}.blob`));
await inject(resolve(out, bin), 'NODE_SEA_BLOB', data, {
  sentinelFuse: 'NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2',
  machoSegmentName: isMac ? 'NODE_SEA' : undefined,
});

// sign the binary (macOS and Windows only)
if (isMac) await exec(`codesign --sign - ${bin}`, { cwd: out });
if (isWin) await exec(`signtool sign /fd SHA256 ${bin}`, { cwd: out });
