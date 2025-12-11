import { getCurrentWindow } from '@tauri-apps/api/window';
import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, eventOptions } from 'lit/decorators.js';

import styles from './title-bar.component.css?inline';

@customElement('xlp-title-bar')
export class TitleBar extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  @eventOptions({ capture: true })
  handleDragging(event: MouseEvent) {
    // too many buttons pressed
    if (event.buttons !== 1) {
      return;
    }

    // prevent text selection and start dragging
    // https://tauri.app/plugin/window-customization/#manual-implementation-of-data-tauri-drag-region
    event.preventDefault();
    getCurrentWindow().startDragging();
  }

  override connectedCallback() {
    super.connectedCallback();
    this.addEventListener('mousedown', this.handleDragging);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('mousedown', this.handleDragging);
  }

  override render() {
    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'xlp-title-bar': TitleBar;
  }
}
