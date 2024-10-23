import { argv } from 'node:process';

import { md2docx } from '@adobe/helix-md2docx';

(async () => {
  console.info('Hello World!');

  const [, , markdown] = argv;
  const buffer = await md2docx(markdown);
  const doc = new TextDecoder().decode(buffer);
  console.log(doc);
})();
