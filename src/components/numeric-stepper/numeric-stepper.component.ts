import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, eventOptions, property } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';

import { finiteOr } from '../../utils/numeric.utils.js';
import styles from './numeric-stepper.component.css?inline';

@customElement('xlp-numeric-stepper')
export class NumericStepper extends LitElement {
  static override readonly styles = unsafeCSS(styles);

  @property({ type: String, reflect: true })
  readonly orientation: 'horizontal' | 'vertical' = 'vertical';

  @property({ type: Boolean, reflect: true })
  readonly disabled = false;

  @property({ type: Number, reflect: true })
  readonly min = -Infinity;

  @property({ type: Number, reflect: true })
  readonly max = Infinity;

  @property({ type: Number, reflect: true })
  readonly value!: number;

  @eventOptions({ passive: true })
  decrease() {
    const next = finiteOr(this.value - 1, finiteOr(this.min, finiteOr(this.max, 0)));
    const value = Math.max(next, this.min);

    if (value === this.value) return;
    this.dispatchEvent(new CustomEvent('change', { detail: value }));
    this.dispatchEvent(new CustomEvent('decrease', { detail: value }));
  }

  @eventOptions({ passive: true })
  increase() {
    const next = finiteOr(this.value + 1, finiteOr(this.max, finiteOr(this.min, 0)));
    const value = Math.min(next, this.max);

    if (value === this.value) return;
    this.dispatchEvent(new CustomEvent('change', { detail: value }));
    this.dispatchEvent(new CustomEvent('increase', { detail: value }));
  }

  @eventOptions({ passive: true })
  reset() {
    this.dispatchEvent(new CustomEvent('change'));
    this.dispatchEvent(new CustomEvent('reset'));
  }

  override render() {
    return html`
      <label>
        ${when(
          !Number.isFinite(this.value),
          () => html`<xlp-icon>all_inclusive</xlp-icon>`,
          () => html`<span>${this.value}</span>`,
        )}
      </label>
      <xlp-icon-button ?disabled="${this.disabled}" @click="${this.increase}">
        <xlp-icon>keyboard_arrow_up</xlp-icon>
      </xlp-icon-button>
      <xlp-icon-button ?disabled="${this.disabled}" @click="${this.reset}">
        <slot></slot>
      </xlp-icon-button>
      <xlp-icon-button ?disabled="${this.disabled}" @click="${this.decrease}">
        <xlp-icon>keyboard_arrow_down</xlp-icon>
      </xlp-icon-button>
    `;
  }
}

declare global {
  interface HTMLElementEventMap {
    change: CustomEvent<number | null>;
    increase: CustomEvent<number>;
    decrease: CustomEvent<number>;
    reset: CustomEvent<void>;
  }

  interface HTMLElementTagNameMap {
    'xlp-numeric-stepper': NumericStepper;
  }
}
