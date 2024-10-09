import '../icon/icon.component.js';
import '../preview/preview.component.js';
import '../title-bar/title-bar.component.js';
import '../tool-bar/tool-bar.component.js';
import '../select-file/select-file.component.js';

import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, eventOptions, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { when } from 'lit/directives/when.js';
import { parse } from 'marked';

import { convertToMarkdown } from '../../utils/conversion.utils.js';
import { readAndWatchFile } from '../../utils/file.utils.js';
import { readMindMap } from '../../utils/xmind.utils.js';
import styles from './root.component.css?inline';

@customElement('xlp-root')
export class Root extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  #listeners: Array<() => void> = [];

  @state()
  private filePath?: string;

  @state()
  private fileContent?: string;

  @eventOptions({ passive: true })
  async loadFile({ detail: path }: CustomEvent<string>) {
    this.filePath = path;
    const remove = await readAndWatchFile(path, async data => {
      const workbook = await readMindMap(data);
      this.fileContent = await parse(convertToMarkdown(workbook));
    });
    this.#listeners.push(remove);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.#listeners.forEach(remove => remove());
  }

  override render() {
    return html`
      <xlp-title-bar role="banner"></xlp-title-bar>
      <xlp-tool-bar role="navigation" hide-after="500"></xlp-tool-bar>

      <main>
        ${when(
          this.filePath === undefined,
          () => html`<xlp-preview>${unsafeHTML(this.fileContent)}</xlp-preview>`,
          () => html`
            <xlp-select-file @path="${this.loadFile}">
              <xlp-icon>place_item</xlp-icon>
              Xmind-Datei hier ablegen
            </xlp-select-file>
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
