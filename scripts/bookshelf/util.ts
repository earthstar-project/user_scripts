import { getEpubMetadata } from "https://deno.land/x/epub_metadata@0.1.3/mod.ts";
import { Earthstar } from "../../deps.ts";

type BookshelfItem = {
  title: string;
  creator: string;
  document: Earthstar.DocEs5;
};

export async function getAllBooks(
  replica: Earthstar.Replica,
): Promise<Map<string, BookshelfItem>> {
  const bookDocs = await replica.queryDocs({
    filter: {
      pathStartsWith: "/books/~",
      pathEndsWith: ".epub",
    },
  });

  const map = new Map();

  for (const doc of bookDocs) {
    // get metadata.
    const attachment = await replica.getAttachment(doc);

    if (!attachment || Earthstar.isErr(attachment)) {
      continue;
    }

    try {
      const metadata = await getEpubMetadata(await attachment.stream());

      map.set(doc.attachmentHash as string, {
        title: metadata.title,
        creator: metadata.creators?.join(", ") || "unknown",
        document: doc,
      });
    } catch {
      continue;
    }
  }

  return map;
}
