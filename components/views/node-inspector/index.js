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
    }
  }

  constructor() {
    super();
    // Good place to set defaults.
    this.open = false;
    this.list = []
    this.selected = false;
  }

  // anchored at bottom-right by map-view
  // `max-height: 97vh` allows `overflow: scroll` to work
  // there are two flex columns per li: doge-icon and .col
  // .loc is moved up to the line above and right-aligned inside .col,
  // which has a width for this reason.
  static styles = css`
    .wrap {
      display: block;
      position: absolute;
      bottom: 0;
      right: 0;
      width: 350px;
      max-height: 97vh;
      overflow-x: hidden;
      overflow-y: scroll;
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
      width: 100%;
      list-style: none;
      display: flex;
    }
    doge-icon {
      display: block;
      width: 48px;
      height: 48px;
      margin-top: 8px;
      margin-left: 12px;
      x-outline:1px solid red;
    }
    .col {
      width: 282px;
      padding-left: 12px;
      margin-bottom: 0px;
      x-outline:1px solid blue;
      flex: 1;
    }
    h4 {
      margin-top:0;
      margin-bottom:0;
      padding-top:0;
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
      height: 13px;
      color: #aaa;
    }
    .loc {
      font-size: 11px;
      line-height: 12px;
      color: #888;
      text-align: right;
      position: relative;
      top: -12px;
      left: -8px;
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
          <ul>
            ${(this.list||[]).map((n) => html`
              <li>
                <doge-icon data="${n.icon}"></doge-icon>
                <div class="col">
                  <h4>${n.name}</h3>
                  <div class="bio">${n.bio}</div>
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
