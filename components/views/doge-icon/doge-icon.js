// Depends on @vendor/dogeicon
// index.html imports /vendor/@dogeicon/dogeicon-un.js

class DogeIconElement extends HTMLElement {
  static observedAttributes = ["data"];

  constructor() {
    super();
    this.c = null;
    this.imgData = "";
    this.dataChanged = false;
  }

  connectedCallback() {
    console.log(`doge-icon: connected.`);
    if (!this.c) {
      this.c = document.createElement("canvas");
      this.c.width = 48;
      this.c.height = 48;
      this.appendChild(this.c);
      // handle case where attributeChangedCallback() happened first.
      if (this.dataChanged) this.drawIcon();
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    // this can happen before connectedCallback()
    // which means we need internal attribute change-tracking.
    console.log(`doge-icon: attribute ${name} changed.`);
    if (name === "data") {
      this.imgData = newValue;
      this.dataChanged = true;
      // handle case where connectedCallback() happened first.
      if (this.c !== null) this.drawIcon();
    }
  }

  drawIcon() {
    console.log(`doge-icon: drawing the icon.`);
    this.dataChanged = false;
    var gfx = this.c.getContext("2d");
    if (this.imgData) {
      var compressed = this.decodeBase64(this.imgData);
      var rgb = DogeIcon.uncompress(compressed); // RGB data
      // copy the RGB pixels to the canvas
      var imdata = new ImageData(48, 48); // RGBA data
      var rgba = imdata.data;
      for (var r=0,w=0; r<48*48*3; r+=3,w+=4) { // RGB -> RGBA
        rgba[w] = rgb[r];
        rgba[w+1] = rgb[r+1];
        rgba[w+2] = rgb[r+2];
        rgba[w+3] = 255;
      }
      gfx.putImageData(imdata, 0, 0);
      this.imgData = ""; // free it.
    } else {
      gfx.fillStyle = '#333333';
      gfx.fillRect(0, 0, 48, 48);
    }
  }

  decodeBase64(str) {
    var bstr = atob(str);
    var buf = new Uint8Array(bstr.length);
    for (var i=0; i<bstr.length; i++) {
      buf[i] = bstr.charCodeAt(i);
    }
    return buf;
  }
}

customElements.define("doge-icon", DogeIconElement);
