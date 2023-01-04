import { Earthstar, Input, Select } from "../../deps.ts";
import { pickReplica } from "../../helpers/pick_replica.ts";
import { getAllBooks } from "./util.ts";

// Pick replica
const replica = await pickReplica();

// Pick from list of books
const allBooks = await getAllBooks(replica);

const options: { name: string; value: string }[] = [];

for (const [hash, item] of allBooks) {
  const name = `${item.title} - ${item.creator}`;

  options.push({
    name,
    value: hash,
  });
}

const choice = await Select.prompt({
  message: "Which book would you like to download?",
  options,
});

const doc = allBooks.get(choice)!.document;

const attachment = await replica.getAttachment(doc);

// Shouldn't happen at this point but best be safe.
if (!attachment || Earthstar.isErr(attachment)) {
  console.error("Don't have the attachment for the book you chose!");
  Deno.exit(1);
}

// Decide where to save it
const path = await Input.prompt("The path you'd like to save this book to");

try {
  const file = await Deno.open(path, { createNew: true, write: true });

  const bookStream = await attachment.stream();

  await bookStream.pipeTo(file.writable);

  console.log(`✅ Saved to ${path}`);
  console.log("👋 Enjoy!");

  Deno.exit(0);
} catch (err) {
  console.error("Can't write to", path);
  console.error(err);
  Deno.exit(1);
}
