import { html, LitElement, unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators.js';

import styles from './icon.component.css?inline';

// https://fonts.google.com/icons
// https://github.com/material-components/material-web/tree/main/icon
@customElement('xlp-icon')
export class Icon extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  override connectedCallback() {
    super.connectedCallback();

    const ariaHidden = this.getAttribute('aria-hidden');
    if (ariaHidden === 'false') {
      this.removeAttribute('aria-hidden');
      return;
    }

    this.setAttribute('aria-hidden', 'true');
  }

  override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'xlp-icon': Icon;
  }
}
