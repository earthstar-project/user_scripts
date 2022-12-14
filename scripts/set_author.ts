import { Earthstar, Input } from "../deps.ts";

const address = await Input.prompt({
  message: "What is the existing keypair's address?",
});

const secret = await Input.prompt({
  message: "What is the existing keypair's secret?",
});

const settings = new Earthstar.ClientSettings();

if (settings.author) {
  const doesWantToReplace = confirm(
    `Settings already has ${settings.author.address} stored. Are you sure you want to replace it?`,
  );

  if (!doesWantToReplace) {
    console.log("Aborting...");
    Deno.exit(0);
  }
}

settings.author = { address, secret };

console.log(`Existing keypair saved to settings.`);

Deno.exit(0);
