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

await rename(
  resolve(outputDir, 'output.json'),
  resolve(outputDir, `${basename(inputFile, '.xmind')}.json`),
);

info('XMind file processed');
