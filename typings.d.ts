declare module 'eslint-plugin-import' {
  import type { Linter } from 'eslint';

  declare const js: {
    readonly flatConfigs: {
      readonly recommended: { readonly rules: Readonly<Linter.RulesRecord> };
    };
  };

  export default js;
  export = js;
}
