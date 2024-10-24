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

// https://github.com/TurboDocx/html-to-docx
declare module '@turbodocx/html-to-docx' {
  export type DocumentOptions = {
    orientation: 'portrait' | 'landscape';
    pageSize: Partial<{ height: number; width: number }>;
    margins: Partial<{
      top: number;
      right: number;
      bottom: number;
      left: number;
      header: number;
      footer: number;
      gutter: number;
    }>;
    title: string;
    subject: string;
    creator: string;
    keywords: string[];
    description: string;
    lastModifiedBy: string;
    revision: number;
    createdAt: Date;
    modifiedAt: Date;
    headerType: 'default' | 'first' | 'even';
    header: boolean;
    footerType: 'default' | 'first' | 'even';
    footer: boolean;
    font: string;
    fontSize: number;
    complexScriptFontSize: number;
    table: Partial<{
      row: { cantSplit: boolean };
      borderOptions: Partial<{
        size: number;
        stroke: string;
        color: string;
      }>;
    }>;
    pageNumber: boolean;
    skipFirstHeaderFooter: boolean;
    lineNumber: boolean;
    lineNumberOptions: Partial<{
      start: number;
      countBy: number;
      restart: 'continuous' | 'newPage' | 'newSection';
    }>;
    numbering: { defaultOrderedListStyleType: 'decimal' | string };
    decodeUnicode: boolean;
    lang: `${Lowercase<string>}-${Uppercase<string>}`;
    preprocessing: { skipHTMLMinify: boolean };
  };

  declare function HTMLtoDOCX(
    htmlString: string,
    headerHTMLString?: string,
    documentOptions?: Partial<DocumentOptions>,
    footerHTMLString?: string,
  ): Promise<Uint8Array>;
  export default HTMLtoDOCX;
}
