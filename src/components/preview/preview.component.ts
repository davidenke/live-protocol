import { html, LitElement, unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators.js';

import styles from './preview.component.css?inline';

@customElement('xlp-preview')
export class Preview extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  #slotElements: ChildNode[] = [];

  override createRenderRoot() {
    return this;
  }

  override connectedCallback() {
    this.#slotElements = Array.from(this.childNodes);
    super.connectedCallback();
  }

  protected override render() {
    return html`
      <article>${this.#slotElements}</article>
      <style>
        ${Preview.styles}
      </style>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'xlp-preview': Preview;
  }
}
