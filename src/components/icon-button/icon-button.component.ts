import '../badge/badge.component.js';

import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';

import styles from './icon-button.component.css?inline';

@customElement('xlp-icon-button')
export class IconButton extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  @property({ type: Boolean, reflect: true })
  disabled = false;

  @property({ type: String, reflect: true })
  badge?: string;

  override render() {
    return html`
      ${when(this.badge !== undefined, () => html`<xlp-badge>${this.badge}</xlp-badge>`)}
      <button ?disabled="${this.disabled}">
        <slot></slot>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'xlp-icon-button': IconButton;
  }
}
