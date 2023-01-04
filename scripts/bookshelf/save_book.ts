import { DocEs5 } from "https://deno.land/x/earthstar@v10.0.0/mod.ts";
import { getEpubMetadata } from "https://deno.land/x/epub_metadata/mod.ts";
import { Earthstar, Input, Select } from "../../deps.ts";
import { pickReplica } from "../../helpers/pick_replica.ts";

// Pick replica
const replica = await pickReplica();

// Make list of books

const bookDocs = await replica.queryDocs({
  filter: {
    pathStartsWith: "/books/~",
    pathEndsWith: ".epub",
  },
});

type BookshelfItem = {
  title: string;
  creator: string;
  document: DocEs5;
};

const items: Record<string, BookshelfItem> = {};

for (const doc of bookDocs) {
  // get metadata.
  const attachment = await replica.getAttachment(doc);

  if (!attachment || Earthstar.isErr(attachment)) {
    continue;
  }

  try {
    const metadata = await getEpubMetadata(await attachment.stream());

    items[doc.attachmentHash as string] = {
      title: metadata.title,
      creator: metadata.creators?.join(", ") || "unknown",
      document: doc,
    };
  } catch {
    continue;
  }
}

const options: { name: string; value: string }[] = [];

for (const hash in items) {
  const item = items[hash];

  const name = `${item.title} by ${item.creator}`;

  options.push({
    name,
    value: hash,
  });
}

// Pick from list of books
const choice = await Select.prompt({
  message: "Which book would you like to download?",
  options,
});

const doc = items[choice].document;

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
