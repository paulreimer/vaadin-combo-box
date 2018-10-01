/**
@license
Copyright (c) 2017 Vaadin Ltd.
This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
*/
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import { OverlayElement } from '@vaadin/vaadin-overlay/src/vaadin-overlay.js';
import { IronResizableBehavior } from '@polymer/iron-resizable-behavior/iron-resizable-behavior.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
/**
 * The overlay element.
 *
 * ### Styling
 *
 * See [`<vaadin-overlay>` documentation](https://github.com/vaadin/vaadin-overlay/blob/master/src/vaadin-overlay.html)
 * for `<vaadin-combo-box-overlay>` parts.
 *
 * See [ThemableMixin – how to apply styles for shadow parts](https://github.com/vaadin/vaadin-themable-mixin/wiki)
 *
 * @memberof Vaadin
 * @private
 */
class ComboBoxOverlayElement extends OverlayElement {
  static get is() {
    return 'vaadin-combo-box-overlay';
  }
}

customElements.define(ComboBoxOverlayElement.is, ComboBoxOverlayElement);

/**
 * Element for internal use only.
 *
 * @memberof Vaadin
 * @private
 */
class ComboBoxDropdownElement extends mixinBehaviors(IronResizableBehavior, PolymerElement) {
  static get template() {
    return html`
    <style>
      :host {
        display: block;
      }

      :host > #overlay {
        display: none;
      }
    </style>
    <vaadin-combo-box-overlay id="overlay" hidden\$="[[hidden]]" opened="[[opened]]" template="{{template}}" style="align-items: stretch; margin: 0;">
      <slot></slot>
    </vaadin-combo-box-overlay>
`;
  }

  static get is() {
    return 'vaadin-combo-box-dropdown';
  }

  static get properties() {
    return {
      opened: Boolean,

      template: {
        type: Object,
        notify: true
      },

      /**
       * True if the device supports touch events.
       */
      touchDevice: {
        type: Boolean,
        reflectToAttribute: true,
        value: () => {
          try {
            document.createEvent('TouchEvent');
            return true;
          } catch (e) {
            return false;
          }
        }
      },

      /**
       * The element to position/align the dropdown by.
       */
      positionTarget: {
        type: Object
      },

      /**
       * If `true`, overlay is aligned above the `positionTarget`
       */
      alignedAbove: {
        type: Boolean,
        value: false
      }
    };
  }

  static get observers() {
    return ['_openedChanged(opened)'];
  }

  constructor() {
    super();
    this._boundSetPosition = this._setPosition.bind(this);
    this._boundOutsideClickListener = this._outsideClickListener.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('iron-resize', this._boundSetPosition);
  }

  ready() {
    super.ready();

    // Preventing the default modal behaviour of the overlay on input clicking
    this.$.overlay.addEventListener('vaadin-overlay-outside-click', e => {
      e.preventDefault();
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('iron-resize', this._boundSetPosition);

    // Making sure the overlay is closed and removed from DOM after detaching the dropdown.
    this.opened = false;
  }

  notifyResize() {
    super.notifyResize();

    if (this.positionTarget && this.opened) {
      this._setPosition();
      // Schedule another position update (to cover virtual keyboard opening for example)
      requestAnimationFrame(this._setPosition.bind(this));
    }
  }

  /**
   * Fired after the `vaadin-combo-box-dropdown` opens.
   *
   * @event vaadin-combo-box-dropdown-opened
   */
  /**
   * Fired after the `vaadin-combo-box-dropdown` closes.
   *
   * @event vaadin-combo-box-dropdown-closed
   */

  _openedChanged(opened) {
    if (opened) {
      this.$.overlay.style.position = this._isPositionFixed(this.positionTarget) ? 'fixed' : 'absolute';
      this._setPosition();

      window.addEventListener('scroll', this._boundSetPosition, true);
      document.addEventListener('click', this._boundOutsideClickListener, true);
      this.dispatchEvent(new CustomEvent('vaadin-combo-box-dropdown-opened', {bubbles: true, composed: true}));
    } else {
      window.removeEventListener('scroll', this._boundSetPosition, true);
      document.removeEventListener('click', this._boundOutsideClickListener, true);
      this.dispatchEvent(new CustomEvent('vaadin-combo-box-dropdown-closed', {bubbles: true, composed: true}));
    }
  }


  // We need to listen on 'click' event and capture it and close the overlay before
  // propagating the event to the listener in the button. Otherwise, if the clicked button would call
  // open(), this would happen: https://www.youtube.com/watch?v=Z86V_ICUCD4
  _outsideClickListener(event) {
    const eventPath = event.composedPath();
    if (eventPath.indexOf(this.positionTarget) < 0 && eventPath.indexOf(this.$.overlay) < 0) {
      this.opened = false;
    }
  }

  _isPositionFixed(element) {
    const offsetParent = this._getOffsetParent(element);

    return window.getComputedStyle(element).position === 'fixed' ||
      (offsetParent && this._isPositionFixed(offsetParent));
  }

  _getOffsetParent(element) {
    if (element.assignedSlot) {
      return element.assignedSlot.parentElement;
    } else if (element.parentElement) {
      return element.offsetParent;
    }

    const parent = element.parentNode;

    if (parent && parent.nodeType === 11 && parent.host) {
      return parent.host; // parent is #shadowRoot
    }
  }

  _verticalOffset(overlayRect, targetRect) {
    return this.alignedAbove ? -overlayRect.height : targetRect.height;
  }

  _shouldAlignAbove() {
    const spaceBelow = (
      window.innerHeight -
      this.positionTarget.getBoundingClientRect().bottom -
      Math.min(document.body.scrollTop, 0)
    ) / window.innerHeight;

    return spaceBelow < 0.30;
  }

  _setPosition(e) {
    if (e && e.target) {
      const target = e.target === document ? document.body : e.target;
      const parent = this.$.overlay.parentElement;
      if (!(target.contains(this.$.overlay) || target.contains(this.positionTarget)) || parent !== document.body) {
        return;
      }
    }

    const targetRect = this.positionTarget.getBoundingClientRect();
    this.alignedAbove = this._shouldAlignAbove();

    const overlayRect = this.$.overlay.getBoundingClientRect();
    this._translateX = targetRect.left - overlayRect.left + (this._translateX || 0);
    this._translateY = targetRect.top - overlayRect.top + (this._translateY || 0) +
      this._verticalOffset(overlayRect, targetRect);

    const _devicePixelRatio = window.devicePixelRatio || 1;
    this._translateX = Math.round(this._translateX * _devicePixelRatio) / _devicePixelRatio;
    this._translateY = Math.round(this._translateY * _devicePixelRatio) / _devicePixelRatio;
    this.$.overlay.style.transform = `translate3d(${this._translateX}px, ${this._translateY}px, 0)`;

    this.$.overlay.style.width = this.positionTarget.clientWidth + 'px';
    this.$.overlay.style.justifyContent = this.alignedAbove ? 'flex-end' : 'flex-start';

    // TODO: fire only when position actually changes changes
    this.dispatchEvent(new CustomEvent('position-changed'));
  }
}

customElements.define(ComboBoxDropdownElement.is, ComboBoxDropdownElement);
