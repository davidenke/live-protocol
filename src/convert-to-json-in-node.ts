import { rename } from 'node:fs/promises';
import { basename, relative, resolve } from 'node:path';
import { cwd, platform } from 'node:process';
import { fileURLToPath } from 'node:url';

import processXMind from '@nsea/xmind-handler';
import chalk from 'chalk';

const windows = platform === 'win32';

const inputUrl = new URL('../mocks/business-plan.xmind', import.meta.url);
const outputUrl = new URL('../mocks', import.meta.url);

const inputFile = relative(cwd(), fileURLToPath(inputUrl, { windows }));
const outputDir = relative(cwd(), fileURLToPath(outputUrl, { windows }));

function info(...message: unknown[]) {
  console.info(chalk.cyan('>'), ...message);
}

await processXMind({
  inputFile,
  outputDir,
  outputTypes: ['json'],
  filterMarkers: [],
});

const givenName = resolve(outputDir, 'output.json');
const newName = resolve(outputDir, `${basename(inputFile, '.xmind')}.json`);
await rename(givenName, newName);

info('XMind file processed');
