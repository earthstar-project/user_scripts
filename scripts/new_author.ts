import * as Earthstar from "https://deno.land/x/earthstar@v10.0.0-alpha.3/mod.ts";

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

console.group("Success");
console.log("Author address:", result.address);
console.log("Author secret:", result.secret);
console.groupEnd();
console.log("Save these somewhere safe.");

Deno.exit(0);
