import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import styles from './badge.component.css?inline';

@customElement('xlp-badge')
export class Badge extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  /**
   * Forces the badge to be completely round.
   */
  @property({ type: Boolean, reflect: true })
  circular = false;

  override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'xlp-badge': Badge;
  }
}
