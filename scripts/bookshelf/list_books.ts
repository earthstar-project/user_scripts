import { pickReplica } from "../../helpers/pick_replica.ts";
import { getAllBooks } from "./util.ts";

// Pick replica
const replica = await pickReplica();

// Pick from list of books
const allBooks = await getAllBooks(replica);

for (const [_hash, book] of allBooks) {
  console.log(`${book.title} - ${book.creator}`);
}

await replica.close(false);

Deno.exit(0);
