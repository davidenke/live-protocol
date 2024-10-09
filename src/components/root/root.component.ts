import '../icon/icon.component.js';
import '../preview/preview.component.js';
import '../title-bar/title-bar.component.js';
import '../tool-bar/tool-bar.component.js';
import '../select-file/select-file.component.js';

import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window';
import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, eventOptions, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { when } from 'lit/directives/when.js';
import { parse } from 'marked';

import { convertToMarkdown } from '../../utils/conversion.utils.js';
import { readAndWatchFile } from '../../utils/file.utils.js';
import { readMindMap } from '../../utils/xmind.utils.js';
import styles from './root.component.css?inline';

// TODO organize views better
@customElement('xlp-root')
export class Root extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  readonly #window = getCurrentWindow();
  readonly #listeners: Array<() => void> = [];

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
      const workbook = await readMindMap(data);
      this.contents = await parse(convertToMarkdown(workbook));
    });
    this.#listeners.push(remove);

    this.hasDocument = true;
    await this.#setDocumentView(path.slice(path.lastIndexOf('/') + 1));
  }

  @eventOptions({ passive: true })
  async closeFile() {
    this.contents = undefined;
    this.hasDocument = false;
    await this.#setNoDocumentView('');
    this.#listeners.forEach(remove => remove());
  }

  // view: select file (filePath === undefined)
  async #setNoDocumentView(title: string) {
    await this.#window.setResizable(false);
    await this.#window.setTitleBarStyle('overlay');
    await this.#window.setTitle(title);
    await this.#window.setSize(new LogicalSize(400, 210));
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

  override render() {
    return html`
      <main>
        ${when(
          !this.hasDocument,
          () => html`
            <xlp-title-bar role="banner"></xlp-title-bar>
            <xlp-select-file @path="${this.loadFile}">
              <xlp-icon>place_item</xlp-icon>
              Xmind-Datei hier ablegen
            </xlp-select-file>
          `,
          () => html`
            <xlp-preview>${unsafeHTML(this.contents)}</xlp-preview>
            <xlp-tool-bar role="navigation" hide-after="2000" @close="${this.closeFile}"></xlp-tool-bar>
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
