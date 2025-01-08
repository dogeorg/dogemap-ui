import {
  LitElement,
  html,
  css,
  asyncReplace,
} from "/vendor/@lit/all@3.1.2/lit-all.min.js";

import { bindToClass } from "/utils/class-bind.js";
import * as classMethods from "./lib/index.js";
import { hexMapStyles } from "./styles.js";

/* 
  This component assumes the following are globally available (see index.html):
  - d3, -d3-geo-projection, -d3-hexgrid
  -simple-statistics
*/

class HexMap extends LitElement {
  static get properties() {
    return {
      nonce: { type: String },
      world: { type: Object },
      points: { type: Object },
    };
  }

  static styles = hexMapStyles;

  // declare public properties for other components to read.
  selectedPoints = [];

  constructor() {
    super();
    this.counter = countUp();
    
    // Place holders for things established in /lib/setup.js
    this.canvas;
    this.renderingContext;
    this.projection;
    this.color;
    this.hexagon;
    this.hex;
    this.width = 0; // in css pixels.
    this.height = 0;
    this.pixelRatio = 1;
    this.resizeObserver = void 0;
    this.panX = 0; // in css pixels.
    this.panY = 0;
    this.zoom = 1;
    this.hoverX = 0;
    this.hoverY = 0;
    this.hover = null;
    this.selected = null;
    this.d3zoom = void 0;
    this.ready = false;

    // We have placed some of this class methods
    // into separate files for organisation sake
    // bindToClass glues each to this class.
    bindToClass(classMethods, this);
  }

  connectedCallback() {
    super.connectedCallback();
    // Observe changes to the Element's size.
    this.resizeObserver = new ResizeObserver((entries) => {
      // We always receive this once after the data arrives,
      // so defer the setup until we have our viewport size.
      if (!this.ready) {
        this.ready = true;
        this.setup();
      } else {
        this.resize();
      }
    })
    this.resizeObserver.observe(this.shadowRoot.host);
  }

  disconnectedCallback() {
    this.resizeObserver.unobserve(this.shadowRoot.host);
    super.disconnectedCallback();
  }

  firstUpdated() {
    // On first update (when this component is provided world & point data)
    // Perform the extensive setup function that produces the hexgrig.
    // Refer to /lib/setup.js
    // this.setup(); // wait for 'nonce'
  }

  updated(changedProperties) {
    changedProperties.forEach((oldValue, propName) => {
      if (propName === 'nonce') {
        // When this changes, its a signal for hex-map to re-draw.
        // Only after the first setup() call in ResizeObserver.
        if (this.ready) {
          requestAnimationFrame(()=>{
            this.setup();
          });
        }
      }
    });
  }

  mouseMoveHandler(e) {
    this.hoverX = e.clientX;
    this.hoverY = e.clientY;
    // Request animation frame to rate-limit the work.
    requestAnimationFrame(()=>{
      const hover = this.hitTest(this.hoverX, this.hoverY);
      if (hover !== this.hover) {
        this.hover = hover;
        this.draw();
      }
    });
  }

  mouseDownHandler() {
    if (this.selectHex(this.hover)) {
      requestAnimationFrame(()=>{
        this.draw();
      });
    }
  }

  touchStartHandler(e) {
    if (e.changedTouches && e.changedTouches.length > 0) {
      this.hoverX = e.changedTouches[0].clientX;
      this.hoverY = e.changedTouches[0].clientY;
      // Request animation frame to rate-limit the work.
      requestAnimationFrame(()=>{
        const touched = this.hitTest(this.hoverX, this.hoverY);
        this.hover = touched;
        if (this.selectHex(touched)) {
          this.draw();
        }
      });
    }
  }

  selectHex(hex) {
    // Select the hovered/touched hex (can be null)
    if (this.selected !== hex) {
      this.selected = hex;
      // d3-hexgrid was modified to preserve the binned 'points' array
      // on each hexgrid cell, so we can recover the original points
      // by using the d3-hexgrid userVariables feature (which was broken)
      this.selectedPoints = hex !== null ? hex.points : [];
      this.dispatchEvent(new CustomEvent('selection-changed'));
      return true; // selection changed
    }
    return false;
  }

  render() {
    return html`
      <canvas id="Hexmap" @mousemove="${this.mouseMoveHandler}" @mousedown="${this.mouseDownHandler}" @touchstart="${this.touchStartHandler}"></canvas>

      <!--div class="floating center">
        <p>HexMap Run Time: <span>${asyncReplace(this.counter)}</span></p>
        <p>Last Updated: ${this.nonce}</p>
      </div-->
    `;
  }
}

customElements.define("hex-map", HexMap);

async function* countUp() {
  let count = 0;
  while (true) {
    yield count++;
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for one second
  }
}
