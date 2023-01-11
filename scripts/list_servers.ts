import { Earthstar } from "../deps.ts";

const settings = new Earthstar.SharedSettings();

if (settings.servers.length === 0) {
  console.log("No servers saved to shared settings.");
}

for (const share of settings.servers) {
  console.log(share);
}
