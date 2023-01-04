import { Earthstar, Input } from "../deps.ts";

const address = await Input.prompt({
  message: "What is the share's address?",
});

const secret = await Input.prompt({
  message: "What is the share's secret? (optional)",
});

const settings = new Earthstar.SharedSettings();

const addAddressRes = settings.addShare(address);

if (Earthstar.isErr(addAddressRes)) {
  console.error(addAddressRes);
  Deno.exit(1);
}

if (secret.length > 0) {
  const addSecretRes = await settings.addSecret(address, secret);

  if (Earthstar.isErr(addSecretRes)) {
    console.error(addSecretRes);
    Deno.exit(1);
  }
}

console.log(`${address} added to known shares.`);

Deno.exit(0);
