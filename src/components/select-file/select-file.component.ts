import { listen, TauriEvent } from '@tauri-apps/api/event';
import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import styles from './select-file.component.css?inline';

@customElement('xlp-select-file')
export class SelectFile extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  #listeners: (() => void)[] = [];

  @property({ type: Boolean, reflect: true, attribute: 'dragged-over' })
  draggedOver = false;

  override async connectedCallback() {
    super.connectedCallback();

    this.#listeners.push(
      await listen(TauriEvent.DRAG_ENTER, () => {
        this.draggedOver = true;
      }),
      await listen(TauriEvent.DRAG_LEAVE, () => {
        this.draggedOver = false;
      }),
      await listen<{ paths: string[] }>(TauriEvent.DRAG_DROP, ({ payload }) => {
        this.draggedOver = false;
        const [path] = payload.paths;
        if (path?.endsWith('.xmind')) {
          this.dispatchEvent(new CustomEvent('path', { detail: path }));
        }
      }),
    );
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.#listeners.forEach(remove => remove());
  }

  override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementEventMap {
    path: CustomEvent<string>;
  }

  interface HTMLElementTagNameMap {
    'xlp-select-file': SelectFile;
  }
}
