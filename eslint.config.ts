import config, { setTsConfigRootDir } from '@enke.dev/lint/eslint.config.js';
import { defineConfig } from 'eslint/config';

export default defineConfig([config, setTsConfigRootDir(import.meta.dirname)]);
