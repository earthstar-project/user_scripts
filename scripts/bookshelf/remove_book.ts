import { Earthstar, Select } from "../../deps.ts";
import { pickReplica } from "../../helpers/pick_replica.ts";
import { getAllBooks } from "./util.ts";

// Get shared settings.
const settings = new Earthstar.SharedSettings();

// Check if there's an author.
if (!settings.author) {
  console.log(
    "You need to have an author keypair saved to settings to remove a book.",
  );
  Deno.exit(1);
}

// Pick replica
const replica = await pickReplica();

// Pick from list of books
const allBooks = await getAllBooks(replica);

const options: { name: string; value: string }[] = [];

for (const [hash, item] of allBooks) {
  if (item.document.author !== settings.author.address) {
    continue;
  }

  const name = `${item.title} - ${item.creator}`;

  options.push({
    name,
    value: hash,
  });
}

const choice = await Select.prompt({
  message: "Which book would you like to remove?",
  options,
});

const doc = allBooks.get(choice)!.document;

const result = await replica.wipeDocAtPath(settings.author, doc.path);

if (Earthstar.isErr(result) || result.kind === "failure") {
  console.error(
    "Couldn't wipe the document",
    Earthstar.isErr(result) ? result.message : result.reason,
  );

  Deno.exit(1);
}

console.log("✅ Removed book");

await replica.close(false);

Deno.exit(0);
