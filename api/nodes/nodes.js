import ApiClient from "/api/client.js";
import { store } from "/state/store.js";

import { generateMockedNodes } from "./nodes.mocks.js";

const client = new ApiClient(store.networkContext.apiBaseUrl, store.networkContext);

export async function getNodes() {
  return client.get("nodes", { mock: generateMockedNodes, cache: "reload" });
}

