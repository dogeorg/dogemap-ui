import { LitElement, html, css, nothing } from '/vendor/@lit/all@3.1.2/lit-all.min.js';
import { store } from "/state/store.js";

// Components
import "/components/views/doge-icon/doge-icon.js";

class NodeInspector extends LitElement {

  static get properties() {
    return {
      open: { type: Boolean },
      list: { type: Object },
      selected: { type: String },
      lat: { type: String },
      lon: { type: String },
    }
  }

  constructor() {
    super();
    // Good place to set defaults.
    this.open = false;
    this.list = []
    this.selected = false;
    this.lat = "";
    this.lon = "";
  }

  static styles = css`
    .wrap {
      position: absolute;
      bottom: 0px;
      right: 0px;
      display: block;
      width: 350px;
      padding: 0em 1em 0.5em;
      margin: 1em;
      background: rgba(255,255,255,0.1);
    }
    .wrap[hidden="true"] {
      display: none;
    }
    ul {
      width: 100%;
      padding-left: 0;
    }
    li {
      list-style: none;
      display: flex;
      width: 100%;
    }
    doge-icon {
      display: block;
      width: 48px;
      height: 48px;
      margin-top: 8px;
      x-outline:1px solid red;
    }
    h4 {
      margin-top:0;
      margin-bottom:0;
      padding-top:0;
    }
    .col {
      padding-left: 12px;
      margin-bottom: 0px;
      x-outline:1px solid blue;
      flex: 1;
    }
    .bio {
      font-size: 12px;
      line-height: 13px;
      color: #ccc;
      margin-top:0;
      margin-bottom:6px;
    }
    .city {
      font-size: 12px;
      line-height: 13px;
      color: #aaa;
    }
    .loc {
      font-size: 11px;
      line-height: 12px;
      color: #888;
      text-align: right;
      position: relative;
      top: -12px;
    }
  `

  closeNode() {
    store.updateState({
      nodeContext: { inspectedNodeId: null }
    })
  }

  connectedCallback() {
    super.connectedCallback();
  }

  render() {
    return html`
      <div class="wrap" hidden=${!this.open}>
      
        ${!this.selected ? html`
          <h3>Nodes at ${this.lat},${this.lon}</h3>
          <ul>
            ${(this.list||[]).map((n) => html`
              <li>
                <doge-icon data="${n.icon}"></doge-icon>
                <div class="col">
                  <h4>${n.name}</h3>
                  <div class="bio">${n.bio || "This can be really long, it has a lot of words and details. It can be up to 120 characters long. So it ends about here."}</div>
                  <div class="city">${n.city} ${n.country}</div>
                  <div class="loc">${n.lat},${n.lon}</div>
                </div>
              </li>
            `)}
          </ul>
      ` : nothing}

        ${this.selected ? html`
          <h3><a href="/" @click=${this.closeNode}>← Back</a></h3>
          <p>Inspecting Node: ${this.selected}</p>
      ` : nothing}

      </div>
    `;
  }
}

customElements.define('node-inspector', NodeInspector);
