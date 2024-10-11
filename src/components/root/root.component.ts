import '../icon/icon.component.js';
import '../numeric-stepper/numeric-stepper.component.js';
import '../preview/preview.component.js';
import '../select-file/select-file.component.js';
import '../title-bar/title-bar.component.js';
import '../tool-bar/tool-bar.component.js';

import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window';
import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, eventOptions, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { when } from 'lit/directives/when.js';
import { parse } from 'marked';

import { type ConversionOptions, convertToMarkdown, type MindMap } from '../../utils/conversion.utils.js';
import { getFileName, readAndWatchFile } from '../../utils/file.utils.js';
import { readMindMap } from '../../utils/xmind.utils.js';
import styles from './root.component.css?inline';

@customElement('xlp-root')
export class Root extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  readonly #window = getCurrentWindow();
  readonly #listeners: Array<() => void> = [];

  @state()
  conversionOptions: ConversionOptions = {
    useHeadlinesUntilLevel: 2,
    useOrderedListsUntilLevel: 4,
    useUnorderedListsUntilLevel: Infinity,
  };

  @state()
  private mindMap?: MindMap;

  @state()
  private contents?: string;

  /**
   * @internal
   */
  @property({ type: Boolean, reflect: true, attribute: 'has-document' })
  private hasDocument = false;

  @eventOptions({ passive: true })
  async loadFile({ detail: path }: CustomEvent<string>) {
    const remove = await readAndWatchFile(path, async data => {
      this.mindMap = await readMindMap(data);
      this.renderContents();
    });
    this.#listeners.push(remove);

    this.hasDocument = true;
    await this.#setDocumentView(getFileName(path));
  }

  @eventOptions({ passive: true })
  async closeFile() {
    this.contents = undefined;
    this.hasDocument = false;
    await this.#setNoDocumentView('');
    this.#listeners.forEach(remove => remove());
  }

  @eventOptions({ passive: true })
  setHeadlineLevel({ detail: value }: CustomEvent<number>) {
    const useHeadlinesUntilLevel = (value as 0) ?? 2;
    this.conversionOptions = {
      ...this.conversionOptions,
      useHeadlinesUntilLevel,
      useOrderedListsUntilLevel: Math.max(useHeadlinesUntilLevel, this.conversionOptions.useOrderedListsUntilLevel),
      useUnorderedListsUntilLevel: Math.max(useHeadlinesUntilLevel, this.conversionOptions.useUnorderedListsUntilLevel),
    };
    this.renderContents();
  }

  @eventOptions({ passive: true })
  setOrderedListLevel({ detail: value }: CustomEvent<number>) {
    this.conversionOptions = { ...this.conversionOptions, useOrderedListsUntilLevel: value ?? 4 };
    this.renderContents();
  }

  @eventOptions({ passive: true })
  setUnorderedListLevel({ detail: value }: CustomEvent<number>) {
    this.conversionOptions = { ...this.conversionOptions, useUnorderedListsUntilLevel: value ?? Infinity };
    this.renderContents();
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

  async renderContents() {
    if (this.mindMap === undefined) return;
    this.contents = await parse(convertToMarkdown(this.mindMap, this.conversionOptions));
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
            <xlp-preview>${unsafeHTML(this.contents)}</xlp-preview>
            <xlp-tool-bar role="navigation" hide-after="2000">
              <xlp-numeric-stepper
                @change="${this.setHeadlineLevel}"
                min="0"
                max="6"
                value="${this.conversionOptions.useHeadlinesUntilLevel}"
              >
                <xlp-icon>title</xlp-icon>
              </xlp-numeric-stepper>

              <xlp-numeric-stepper
                @change="${this.setOrderedListLevel}"
                min="${this.conversionOptions.useHeadlinesUntilLevel}"
                value="${this.conversionOptions.useOrderedListsUntilLevel}"
              >
                <xlp-icon>format_list_numbered</xlp-icon>
              </xlp-numeric-stepper>

              <xlp-numeric-stepper
                @change="${this.setUnorderedListLevel}"
                min="${this.conversionOptions.useHeadlinesUntilLevel}"
                value="${this.conversionOptions.useUnorderedListsUntilLevel}"
              >
                <xlp-icon>format_list_bulleted</xlp-icon>
              </xlp-numeric-stepper>
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
