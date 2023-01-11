import { Earthstar } from "../deps.ts";

const settings = new Earthstar.SharedSettings();

if (!settings.author) {
  console.log("No author keypair currently saved to settings.");
  Deno.exit(0);
}

console.group("Current author keypair:");
console.log(settings.author.address);

const isSure = confirm("Are you sure you want to forget this keypair?");

if (isSure) {
  settings.author = null;

  console.log("✅ Forgot author keypair");
}

Deno.exit(0);
