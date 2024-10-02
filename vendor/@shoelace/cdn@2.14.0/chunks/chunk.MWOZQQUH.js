import {
  SlMenu
} from "./chunk.Q2X27W2N.js";

// src/react/menu/index.ts
import * as React from "react";
import { createComponent } from "@lit/react";
import "@lit/react";
var tagName = "sl-menu";
SlMenu.define("sl-menu");
var reactWrapper = createComponent({
  tagName,
  elementClass: SlMenu,
  react: React,
  events: {
    onSlSelect: "sl-select"
  },
  displayName: "SlMenu"
});
var menu_default = reactWrapper;

export {
  menu_default
};
