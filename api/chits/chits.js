import ApiClient from "/api/client.js";
import { store } from "/state/store.js";

import { generateMockedChits } from "./chits.mocks.js";

const client = new ApiClient(store.networkContext.apiBaseUrl, store.networkContext);

// get multiple node bio 'chits'
// body must be [{ identity:"pubkey-hex", node:"pubkey-hex" }]
// result is [{}]:
//   name: string     // [30] display name
//   bio: string      // [120] short biography
//   lat: string      // WGS84 +/- 90 degrees, floating point
//   lon: string      // WGS84 +/- 180 degrees, floating point
//   country: string  // [2] ISO 3166-1 alpha-2 code
//   city: string     // [30] city name
//   icon: string     // [1585] compressed icon (base64-encoded)
//   nodes: []string  // public keys of nodes claimed by this identity (hex-encoded)
export async function getChits(body) {
  return client.post("chits", body, { mock: generateMockedChits, cache: "reload" });
}
