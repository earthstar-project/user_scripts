import { Earthstar } from "../deps.ts";

const name = Deno.args[0];

if (!name) {
  console.error(
    "You need to provide a 4 character short name for the new keypair.",
  );
  Deno.exit(1);
}

const result = await Earthstar.Crypto.generateAuthorKeypair(name);

if (Earthstar.isErr(result)) {
  console.error(result.message);
  Deno.exit(1);
}

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

settings.author = result;

console.group(`New keypair saved to settings.`);
console.log("Author address:", result.address);
console.log("Author secret:", result.secret);
console.groupEnd();
console.log("Save these somewhere safe.");

Deno.exit(0);
