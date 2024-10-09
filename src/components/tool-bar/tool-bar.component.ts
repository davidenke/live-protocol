import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import styles from './tool-bar.component.css?inline';

@customElement('xlp-tool-bar')
export class ToolBar extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  @property({ type: Boolean, reflect: true })
  override hidden = false;

  @property({ type: Number, reflect: true, attribute: 'hide-after' })
  hideAfter = 3000;

  #currentTimeoutId?: number;
  #isInteractive = false;

  #renewTimeout = () => {
    // reset visibility and clear pending timeouts
    this.hidden = false;
    window.clearTimeout(this.#currentTimeoutId);

    // start new timeout to hide
    this.#currentTimeoutId = window.setTimeout(
      () => (this.hidden = true),
      this.#isInteractive ? Infinity : this.hideAfter,
    );
  };

  #preventHiding = (event: MouseEvent) => {
    // do not bubble up, skip global listener
    event.stopImmediatePropagation();

    // end upcoming timeouts, flag the tool bar as interactive
    window.clearTimeout(this.#currentTimeoutId);
    this.#isInteractive = true;
  };

  #allowHiding = () => {
    // end upcoming (infinite) timeouts, flag as non-interactive
    window.clearTimeout(this.#currentTimeoutId);
    this.#isInteractive = false;
  };

  override connectedCallback() {
    super.connectedCallback();

    // register all listeners
    window.addEventListener('mousemove', this.#renewTimeout);
    this.addEventListener('mousemove', this.#preventHiding);
    this.addEventListener('mouseleave', this.#allowHiding);

    // start initially
    this.#renewTimeout();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();

    // unregister all listeners
    window.removeEventListener('mousemove', this.#renewTimeout);
    this.removeEventListener('mousemove', this.#preventHiding);
    this.removeEventListener('mouseleave', this.#allowHiding);
  }

  override render() {
    return html`
      <nav>
        <button>Foo</button>
        <button>Bar</button>
      </nav>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'xlp-tool-bar': ToolBar;
  }
}
