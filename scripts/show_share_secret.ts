import { Earthstar, Select } from "../deps.ts";

const settings = new Earthstar.SharedSettings();

if (settings.shares.length === 0) {
  console.log("There are no known shares to show secrets for!");
  Deno.exit(0);
}

const choice = await Select.prompt({
  message: "Which server would you like to show the secret for?",
  options: settings.shares,
});

const secret = settings.shareSecrets[choice];

if (!secret) {
  console.log("We don't know the secret for that share...");
  Deno.exit(1);
}

console.log(secret);
Deno.exit(0);
