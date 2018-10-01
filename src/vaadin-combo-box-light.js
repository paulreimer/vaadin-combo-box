/**
@license
Copyright (c) 2017 Vaadin Ltd.
This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import { IronA11yKeysBehavior } from '@polymer/iron-a11y-keys-behavior/iron-a11y-keys-behavior.js';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin.js';
import { ComboBoxMixin } from './vaadin-combo-box-mixin.js';
import './vaadin-combo-box-dropdown-wrapper.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { dashToCamelCase } from '@polymer/polymer/lib/utils/case-map.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
/**
 * `<vaadin-combo-box-light>` is a customizable version of the `<vaadin-combo-box>` providing
 * only the dropdown functionality and leaving the input field definition to the user.
 *
 * The element has the same API as `<vaadin-combo-box>`.
 *
 * To create a custom input field, you need to add a child element which has a two-way
 * data-bindable property representing the input value. The property name is expected
 * to be `value` by default. See the example below for a simplest possible example
 * using a `<vaadin-text-field>` element.
 *
 * ```html
 * <vaadin-combo-box-light>
 *   <vaadin-text-field>
 *   </vaadin-text-field>
 * </vaadin-combo-box-light>
 * ```
 *
 * If you are using other custom input fields like `<iron-input>`, you
 * need to define the name of the bindable property with the `attrForValue` attribute.
 *
 * ```html
 * <vaadin-combo-box-light attr-for-value="bind-value">
 *   <iron-input>
 *     <input>
 *   </iron-input>
 * </vaadin-combo-box-light>
 * ```
 *
 * In the next example you can see how to create a custom input field based
 * on a `<paper-input>` decorated with a custom `<iron-icon>` and
 * two `<paper-button>`s to act as the clear and toggle controls.
 *
 * ```html
 * <vaadin-combo-box-light>
 *   <paper-input label="Elements" class="input">
 *     <iron-icon icon="toll" slot="prefix"></iron-icon>
 *     <paper-button slot="suffix" class="clear-button">Clear</paper-button>
 *     <paper-button slot="suffix" class="toggle-button">Toggle</paper-button>
 *   </paper-input>
 * </vaadin-combo-box-light>
 * ```
 * @memberof Vaadin
 * @mixes Vaadin.ComboBoxMixin
 * @mixes Vaadin.ThemableMixin
 */
class ComboBoxLightElement extends ThemableMixin(ComboBoxMixin(mixinBehaviors(
  [IronA11yKeysBehavior], PolymerElement
))) {
  static get template() {
    return html`
    <slot></slot>

    <vaadin-combo-box-dropdown-wrapper id="overlay" opened="[[opened]]" position-target="[[inputElement]]" _focused-index="[[_focusedIndex]]" _item-label-path="[[itemLabelPath]]" loading="[[loading]]">
    </vaadin-combo-box-dropdown-wrapper>
`;
  }

  static get is() {
    return 'vaadin-combo-box-light';
  }

  static get properties() {
    return {
      /**
       * Name of the two-way data-bindable property representing the
       * value of the custom input field.
       */
      attrForValue: {
        type: String,
        value: 'value'
      },

      inputElement: {
        type: Element,
        readOnly: true
      }
    };
  }

  ready() {
    super.ready();
    this._toggleElement = this.querySelector('.toggle-button');
    this._clearElement = this.querySelector('.clear-button');
  }

  get focused() {
    return this.getRootNode().activeElement === this.inputElement;
  }

  connectedCallback() {
    super.connectedCallback();
    const cssSelector = 'vaadin-text-field,iron-input,paper-input,.paper-input-input,.input';
    this._setInputElement(this.querySelector(cssSelector));
    this._revertInputValue();
    this.listen(this.inputElement, 'input', '_inputValueChanged');
    this._preventInputBlur();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.unlisten(this.inputElement, 'input', '_inputValueChanged');
    this._restoreInputBlur();
  }

  get _propertyForValue() {
    return dashToCamelCase(this.attrForValue);
  }

  get _inputElementValue() {
    return this.inputElement && this.inputElement[this._propertyForValue];
  }

  set _inputElementValue(value) {
    if (this.inputElement) {
      this.inputElement[this._propertyForValue] = value;
    }
  }
}

customElements.define(ComboBoxLightElement.is, ComboBoxLightElement);

export { ComboBoxLightElement };
