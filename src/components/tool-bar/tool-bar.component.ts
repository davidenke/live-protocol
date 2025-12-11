import '../icon/icon.component.js';
import '../icon-button/icon-button.component.js';

import { html, LitElement, unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators.js';

import styles from './tool-bar.component.css?inline';

@customElement('xlp-tool-bar')
export class ToolBar extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  override render() {
    return html`<nav><slot></slot></nav>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'xlp-tool-bar': ToolBar;
  }
}
