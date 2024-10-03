import ApiClient from "/api/client.js";
import { store } from "/state/store.js";

import { generateMockedWorld } from "./world.mocks.js";

const client = new ApiClient(store.networkContext.apiBaseUrl, store.networkContext);

export async function getWorld() {
  return client.get("world", { mock: generateMockedWorld });
}
