/**
@license
Copyright (c) 2017 Vaadin Ltd.
This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import '@polymer/iron-a11y-announcer/iron-a11y-announcer.js';
import '@vaadin/vaadin-text-field/src/vaadin-text-field.js';
import { ControlStateMixin } from '@vaadin/vaadin-control-state-mixin/vaadin-control-state-mixin.js';
import { ThemableMixin } from '@vaadin/vaadin-themable-mixin/vaadin-themable-mixin.js';
import { ComboBoxMixin } from './vaadin-combo-box-mixin.js';
import './vaadin-combo-box-dropdown-wrapper.js';
import { ElementMixin } from '@vaadin/vaadin-element-mixin/vaadin-element-mixin.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
/**
 * `<vaadin-combo-box>` is a combo box element combining a dropdown list with an
 * input field for filtering the list of items. If you want to replace the default
 * input field with a custom implementation, you should use the
 * [`<vaadin-combo-box-light>`](#/elements/vaadin-combo-box-light) element.
 *
 * Items in the dropdown list must be provided as a list of `String` values.
 * Defining the items is done using the `items` property, which can be assigned
 * with data-binding, using an attribute or directly with the JavaScript property.
 *
 * ```html
 * <vaadin-combo-box
 *     label="Fruit"
 *     items="[[data]]">
 * </vaadin-combo-box>
 * ```
 *
 * ```js
 * combobox.items = ['apple', 'orange', 'banana'];
 * ```
 *
 * When the selected `value` is changed, a `value-changed` event is triggered.
 *
 * This element can be used within an `iron-form`.
 *
 * ### Item Template
 *
 * `<vaadin-combo-box>` supports using custom item template provided in the light
 * DOM:
 *
 * ```html
 * <vaadin-combo-box items='[{"label": "Hydrogen", "value": "H"}]'>
 *   <template>
 *     [[index]]: [[item.label]] <b>[[item.value]</b>
 *   </template>
 * </vaadin-combo-box>
 * ```
 *
 * The following properties are available for item template bindings:
 *
 * Property name | Type | Description
 * --------------|------|------------
 * `index`| Number | Index of the item in the `items` array
 * `item` | String or Object | The item reference
 * `selected` | Boolean | True when item is selected
 * `focused` | Boolean | True when item is focused
 *
 * ### Styling
 *
 * The following custom properties are available for styling:
 *
 * Custom property | Description | Default
 * ----------------|-------------|-------------
 * `--vaadin-combo-box-overlay-max-height` | Property that determines the max height of overlay | `65vh`
 *
 * The following shadow DOM parts are available for styling:
 *
 * Part name | Description
 * ----------------|----------------
 * `text-field` | The text field
 * `clear-button` | The clear button
 * `toggle-button` | The toggle button
 *
 * See [`<vaadin-overlay>` documentation](https://github.com/vaadin/vaadin-overlay/blob/master/src/vaadin-overlay.html)
 * for `<vaadin-combo-box-overlay>` parts.
 *
 * See [`<vaadin-text-field>` documentation](https://vaadin.com/components/vaadin-text-field/html-api/elements/Vaadin.TextFieldElement)
 * for the text field parts.
 *
 * The following state attributes are available for styling:
 *
 * Attribute    | Description | Part name
 * -------------|-------------|------------
 * `opened` | Set when the combo box dropdown is open | :host
 * `disabled` | Set to a disabled combo box | :host
 * `readonly` | Set to a read only combo box | :host
 * `has-value` | Set when the element has a value | :host
 * `invalid` | Set when the element is invalid | :host
 * `focused` | Set when the element is focused | :host
 * `focus-ring` | Set when the element is keyboard focused | :host
 * `loading` | Set when new items are expected | :host
 *
 * See [ThemableMixin – how to apply styles for shadow parts](https://github.com/vaadin/vaadin-themable-mixin/wiki)
 *
 * @memberof Vaadin
 * @mixes Vaadin.ElementMixin
 * @mixes Vaadin.ControlStateMixin
 * @mixes Vaadin.ComboBoxMixin
 * @mixes Vaadin.ThemableMixin
 * @demo demo/index.html
 */
class ComboBoxElement extends
  ElementMixin(
    ControlStateMixin(
      ThemableMixin(
        ComboBoxMixin(PolymerElement)))) {
  static get template() {
    return html`
    <style>
      :host {
        display: inline-block;
      }

      :host([hidden]) {
        display: none !important;
      }

      :host([opened]) {
        pointer-events: auto;
      }

      [part="text-field"] {
        width: 100%;
        min-width: 0;
      }

      [part="clear-button"],
      [part="toggle-button"] {
        font-family: 'vaadin-combo-box-icons';
      }

      [part="clear-button"]::before {
        content: "\\e901";
      }

      [part="toggle-button"]::before {
        content: "\\e900";
      }

      :host([disabled]) [part="clear-button"],
      :host([readonly]) [part="clear-button"],
      :host(:not([has-value])) [part="clear-button"] {
        display: none;
      }
    </style>

    <vaadin-text-field part="text-field" id="input" pattern="[[pattern]]" prevent-invalid-input="[[preventInvalidInput]]" value="{{_inputElementValue}}" autocomplete="off" invalid="[[invalid]]" label="[[label]]" name="[[name]]" placeholder="[[placeholder]]" required="[[required]]" disabled="[[disabled]]" readonly="[[readonly]]" error-message="[[errorMessage]]" autocapitalize="none" autofocus="[[autofocus]]" on-change="_stopPropagation" on-input="_inputValueChanged">
      <slot name="prefix" slot="prefix"></slot>

      <div part="clear-button" id="clearButton" slot="suffix" role="button" aria-label="Clear"></div>
      <div part="toggle-button" id="toggleButton" slot="suffix" role="button" aria-label="Toggle"></div>

    </vaadin-text-field>

    <vaadin-combo-box-dropdown-wrapper id="overlay" opened="[[opened]]" position-target="[[_getPositionTarget()]]" _focused-index="[[_focusedIndex]]" _item-label-path="[[itemLabelPath]]" loading="[[loading]]">
    </vaadin-combo-box-dropdown-wrapper>
`;
  }

  static get is() {
    return 'vaadin-combo-box';
  }

  static get version() {
    return '4.1.0';
  }

  static get properties() {
    return {
      /**
       * The label for this element.
       */
      label: {
        type: String,
        reflectToAttribute: true
      },

      /**
       * Set to true to mark the input as required.
       */
      required: {
        type: Boolean,
        value: false
      },

      /**
       * Set to true to disable this input.
       */
      disabled: {
        type: Boolean,
        value: false
      },

      /**
       * Set to true to prevent the user from entering invalid input.
       */
      preventInvalidInput: {
        type: Boolean
      },

      /**
       * A pattern to validate the `input` with.
       */
      pattern: {
        type: String
      },

      /**
       * The error message to display when the input is invalid.
       */
      errorMessage: {
        type: String
      },

      autofocus: {
        type: Boolean
      },

      /**
       * A placeholder string in addition to the label.
       */
      placeholder: {
        type: String,
        value: ''
      },

      readonly: {
        type: Boolean,
        value: false
      }
    };
  }

  static get observers() {
    return ['_updateAriaExpanded(opened)'];
  }

  attributeChanged(name, type) {
    // Safari has an issue with repainting shadow root element styles when a host attribute changes.
    // Need this workaround (toggle any inline css property on and off) until the issue gets fixed.
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari && this.root) {
      Array.prototype.forEach.call(this.root.querySelectorAll('*'), el => {
        el.style['-webkit-backface-visibility'] = 'visible';
        el.style['-webkit-backface-visibility'] = '';
      });
    }
  }

  ready() {
    super.ready();

    this._nativeInput = this.$.input.focusElement;
    this._toggleElement = this.$.toggleButton;
    this._clearElement = this.$.clearButton;

    this._nativeInput.setAttribute('role', 'combobox');
    this._nativeInput.setAttribute('aria-autocomplete', 'list');
    this._updateAriaExpanded();
  }

  connectedCallback() {
    super.connectedCallback();
    this._preventInputBlur();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._restoreInputBlur();
  }

  _getPositionTarget() {
    return this.$.input;
  }

  _updateAriaExpanded() {
    if (this._nativeInput) {
      this._nativeInput.setAttribute('aria-expanded', this.opened);
      this._toggleElement.setAttribute('aria-expanded', this.opened);
    }
  }

  get inputElement() {
    return this.$.input;
  }

  /**
   * Focusable element used by vaadin-control-state-mixin
   */
  get focusElement() {
    // inputElement might not be defined on property changes before ready.
    return this.inputElement || this;
  }
}

customElements.define(ComboBoxElement.is, ComboBoxElement);

export { ComboBoxElement };
