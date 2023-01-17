import { Earthstar } from "../deps.ts";

const settings = new Earthstar.SharedSettings();

if (settings.shares.length === 0) {
  console.log("No shares saved to shared settings.");
}

for (const share of settings.shares) {
  console.log(share);
}
