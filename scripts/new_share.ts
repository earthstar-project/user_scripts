import * as Earthstar from "https://deno.land/x/earthstar@v10.0.0-alpha.3/mod.ts";

const name = Deno.args[0];

if (!name) {
  console.error("You need to provide a name for your new share.");
  Deno.exit(1);
}

const result = await Earthstar.Crypto.generateShareKeypair(name);

if (Earthstar.isErr(result)) {
  console.error(result.message);
  Deno.exit(1);
}

console.group("Success");
console.log("Share address:", result.shareAddress);
console.log("Share secret:", result.secret);
console.groupEnd();
console.log("Save these somewhere safe.");
console.log("Share the address with people you want to give read access.");
console.log("Share the secret with people you want to give write access to.");

Deno.exit(0);
