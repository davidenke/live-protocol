import '../button-group/button-group.component.js';
import '../icon/icon.component.js';
import '../icon-button/icon-button.component.js';
import '../numeric-stepper/numeric-stepper.component.js';
import '../preview/preview.component.js';
import '../select-file/select-file.component.js';
import '../title-bar/title-bar.component.js';
import '../tool-bar/tool-bar.component.js';

import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window';
import { save } from '@tauri-apps/plugin-dialog';
import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, eventOptions, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { when } from 'lit/directives/when.js';

import {
  type ConversionOptions,
  convertToDocx,
  convertToHtml,
  convertToMarkdown,
  type MindMap,
} from '../../utils/conversion.utils.js';
import { exportFile, getFileName, readAndWatchFile } from '../../utils/file.utils.js';
import { readMindMap } from '../../utils/xmind.utils.js';

import styles from './root.component.css?inline';

@customElement('xlp-root')
export class Root extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  readonly #window = getCurrentWindow();
  readonly #listeners: Array<() => void> = [];

  @state()
  conversionOptions: ConversionOptions = {
    useUntilLevel: Infinity,
    useHeadlinesUntilLevel: 2,
    useOrderedListsUntilLevel: 4,
    useUnorderedListsUntilLevel: Infinity,
  };

  @state()
  private mindMap?: MindMap;

  @state()
  private contents?: { path: string; md: string; html: string };

  /**
   * @internal
   */
  @property({ type: Boolean, reflect: true, attribute: 'has-document' })
  private hasDocument = false;

  @eventOptions({ passive: true })
  async loadFile({ detail: path }: CustomEvent<string>) {
    const remove = await readAndWatchFile(path, async data => {
      this.mindMap = await readMindMap(data);
      this.#renderContents(path);
    });
    this.#listeners.push(remove);

    this.hasDocument = true;
    await this.#setDocumentView(getFileName(path).name);
  }

  @eventOptions({ passive: true })
  async closeFile() {
    this.contents = undefined;
    this.hasDocument = false;
    await this.#setNoDocumentView('');
    this.#listeners.forEach(remove => remove());
  }

  @eventOptions({ passive: true })
  setVisibilityLevel({ detail: value }: CustomEvent<number>) {
    const useUntilLevel = Math.max(1, value ?? Infinity);
    this.conversionOptions = {
      ...this.conversionOptions,
      useUntilLevel,
      useHeadlinesUntilLevel: Math.min(useUntilLevel, this.conversionOptions.useHeadlinesUntilLevel) as 0,
      useOrderedListsUntilLevel: Math.min(useUntilLevel, this.conversionOptions.useOrderedListsUntilLevel),
      useUnorderedListsUntilLevel: Math.min(useUntilLevel, this.conversionOptions.useUnorderedListsUntilLevel),
    };

    if (this.contents === undefined) return;
    this.#renderContents(this.contents.path);
  }

  @eventOptions({ passive: true })
  setHeadlineLevel({ detail: value }: CustomEvent<number>) {
    const useHeadlinesUntilLevel = Math.min(this.conversionOptions.useUntilLevel, value ?? 2) as 0;
    this.conversionOptions = {
      ...this.conversionOptions,
      useHeadlinesUntilLevel,
      useOrderedListsUntilLevel: Math.max(useHeadlinesUntilLevel, this.conversionOptions.useOrderedListsUntilLevel),
      useUnorderedListsUntilLevel: Math.max(useHeadlinesUntilLevel, this.conversionOptions.useUnorderedListsUntilLevel),
    };

    if (this.contents === undefined) return;
    this.#renderContents(this.contents.path);
  }

  @eventOptions({ passive: true })
  setOrderedListLevel({ detail: value }: CustomEvent<number>) {
    this.conversionOptions = {
      ...this.conversionOptions,
      useOrderedListsUntilLevel: Math.min(this.conversionOptions.useUntilLevel, value ?? 4),
    };

    if (this.contents === undefined) return;
    this.#renderContents(this.contents.path);
  }

  @eventOptions({ passive: true })
  setUnorderedListLevel({ detail: value }: CustomEvent<number>) {
    this.conversionOptions = {
      ...this.conversionOptions,
      useUnorderedListsUntilLevel: Math.min(this.conversionOptions.useUntilLevel, value ?? Infinity),
    };

    if (this.contents === undefined) return;
    this.#renderContents(this.contents.path);
  }

  @eventOptions({ passive: true })
  async exportFile(event: Event) {
    // we need contents in any case
    if (this.contents === undefined) return;

    // read the format from the event target and handle it, albeit markdown and
    // html are already available and don't have to be explicitly converted
    const { dataset } = event.currentTarget as HTMLElement;
    const { base: fileBaseName } = getFileName(this.contents.path);

    switch (dataset.format) {
      case 'md': {
        const defaultPath = `${fileBaseName}.md`;
        const filters = [{ name: 'Markdown', extensions: ['md', 'mdx', 'markdown'] }];
        const path = await save({ defaultPath, filters });
        if (path !== null) await exportFile(path, this.contents.md);
        break;
      }
      case 'html': {
        const defaultPath = `${fileBaseName}.html`;
        const filters = [{ name: 'HTML', extensions: ['html', 'htm'] }];
        const path = await save({ defaultPath, filters });
        if (path !== null) await exportFile(path, this.contents.html);
        break;
      }
      case 'docx': {
        const defaultPath = `${fileBaseName}.docx`;
        const filters = [{ name: 'Document', extensions: ['docx', 'doc'] }];
        const path = await save({ defaultPath, filters });
        // const content = await convertToDocx(this.contents.md);
        const content = await convertToDocx(`file://${this.contents.path}`);
        if (path !== null) await exportFile(path, content);
        break;
      }
    }
  }

  // view: select file (filePath === undefined)
  async #setNoDocumentView(title: string) {
    await this.#window.setResizable(false);
    await this.#window.setTitleBarStyle('overlay');
    await this.#window.setTitle(title);
    await this.#window.setSize(new LogicalSize(250, 250));
  }

  // view: preview file (filePath !== undefined)
  async #setDocumentView(title: string) {
    await this.#window.setSize(new LogicalSize(595, 842)); // a4 portrait
    await this.#window.setResizable(true);
    await this.#window.setTitleBarStyle('transparent');
    await this.#window.setTitle(title);
    const close = await this.#window.onCloseRequested(() => this.closeFile());
    this.#listeners.push(close);
  }

  constructor() {
    super();
    this.closeFile();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.#listeners.forEach(remove => remove());
  }

  async #renderContents(path: string) {
    if (this.mindMap === undefined) return;
    const md = convertToMarkdown(this.mindMap, this.conversionOptions);
    const html = await convertToHtml(md);
    this.contents = { path, md, html };
  }

  override render() {
    return html`
      <main>
        ${when(
          !this.hasDocument,
          () => html`
            <xlp-title-bar role="banner"></xlp-title-bar>
            <xlp-select-file @path="${this.loadFile}"><xlp-icon>upload_file</xlp-icon></xlp-select-file>
          `,
          () => html`
            <xlp-preview>${unsafeHTML(this.contents?.html)}</xlp-preview>
            <xlp-select-file background @path="${this.loadFile}"><xlp-icon>upload_file</xlp-icon></xlp-select-file>
            <xlp-tool-bar role="navigation" hide-after="2000">
              <xlp-numeric-stepper
                @change="${this.setVisibilityLevel}"
                min="1"
                value="${this.conversionOptions.useUntilLevel}"
              >
                <xlp-icon>visibility</xlp-icon>
              </xlp-numeric-stepper>

              <xlp-numeric-stepper
                @change="${this.setHeadlineLevel}"
                min="0"
                max="${Math.max(this.conversionOptions.useUntilLevel, 6)}"
                value="${this.conversionOptions.useHeadlinesUntilLevel}"
              >
                <xlp-icon>title</xlp-icon>
              </xlp-numeric-stepper>

              <xlp-numeric-stepper
                @change="${this.setOrderedListLevel}"
                min="${this.conversionOptions.useHeadlinesUntilLevel}"
                max="${this.conversionOptions.useUntilLevel}"
                value="${this.conversionOptions.useOrderedListsUntilLevel}"
              >
                <xlp-icon>format_list_numbered</xlp-icon>
              </xlp-numeric-stepper>

              <xlp-numeric-stepper
                @change="${this.setUnorderedListLevel}"
                min="${this.conversionOptions.useHeadlinesUntilLevel}"
                max="${this.conversionOptions.useUntilLevel}"
                value="${this.conversionOptions.useUnorderedListsUntilLevel}"
              >
                <xlp-icon>format_list_bulleted</xlp-icon>
              </xlp-numeric-stepper>

              <xlp-button-group orientation="vertical">
                <xlp-icon-button
                  badge="md"
                  data-format="md"
                  ?disabled="${this.contents === undefined}"
                  @click="${this.exportFile}"
                >
                  <xlp-icon>file_export</xlp-icon>
                </xlp-icon-button>

                <xlp-icon-button
                  badge="html"
                  data-format="html"
                  ?disabled="${this.contents === undefined}"
                  @click="${this.exportFile}"
                >
                  <xlp-icon>file_export</xlp-icon>
                </xlp-icon-button>

                <xlp-icon-button
                  badge="docx"
                  data-format="docx"
                  ?disabled="${this.contents === undefined}"
                  @click="${this.exportFile}"
                >
                  <xlp-icon>file_export</xlp-icon>
                </xlp-icon-button>
              </xlp-button-group>
            </xlp-tool-bar>
          `,
        )}
      </main>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'xlp-root': Root;
  }
}
