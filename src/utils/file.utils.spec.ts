import { describe, expect, it } from 'vitest';

import { getFileName } from './file.utils.js';

describe('file.utils', () => {
  describe('getFileName', () => {
    it('delivers the file name from sane paths', () => {
      expect(getFileName('/path/to/file.txt')).toBe('file.txt');
    });

    it('even delivers the file name from clunky paths', () => {
      expect(getFileName('C:\\path\\to\\file.txt')).toBe('file.txt');
    });
  });
});
