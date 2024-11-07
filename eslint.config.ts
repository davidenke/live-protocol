import eslintJs from '@eslint/js';
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginLit from 'eslint-plugin-lit';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintPluginSimpleImportSort from 'eslint-plugin-simple-import-sort';
import eslintPluginUnusedImports from 'eslint-plugin-unused-imports';
import eslintPluginWC from 'eslint-plugin-wc';
import eslintTs from 'typescript-eslint';

export default eslintTs.config(
  eslintJs.configs.recommended,
  ...eslintTs.configs.recommended,
  eslintPluginPrettierRecommended,
  eslintPluginImport.flatConfigs.recommended,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  eslintPluginWC.configs['flat/recommended'] as any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  eslintPluginLit.configs['flat/recommended'] as any,
  {
    ignores: ['dist/', 'node_modules/'],
  },
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        project: true,
        sourceType: 'module',
        tsconfigRootDir: './',
      },
    },
  },
  {
    plugins: {
      'simple-import-sort': eslintPluginSimpleImportSort,
      'unused-imports': eslintPluginUnusedImports,
    },
  },
  {
    settings: {
      'import/resolver': {
        typescript: true,
        node: true,
      },
    },
  },
  {
    rules: {
      // formatting
      'linebreak-style': ['error', 'unix'],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],

      // import sorting
      'simple-import-sort/imports': [
        'error',
        // { groups: [...eslintPluginSimpleImportSort.defaultGroups, ['\\.css\\?inline']] },
      ],
      'simple-import-sort/exports': 'error',
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
      'prettier/prettier': ['error', {}, { usePrettierrc: true }],

      // unused imports
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'unused-imports/no-unused-imports': 'error',
    },
  },
);
