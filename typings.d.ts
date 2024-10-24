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

declare module 'postject' {
  export declare function inject(
    filename: string, // The executable to inject into
    resourceName: string, // The resource name to use (section name on Mach-O and ELF, resource name for PE)
    resourceData: Buffer, // The resource to inject
    options?: Partial<{
      machoSegmentName: string;
      overwrite: boolean;
      sentinelFuse: string;
    }>,
  ): Promise<void>;
}

declare module 'mock:buffer' {}
