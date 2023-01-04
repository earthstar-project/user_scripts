import { Earthstar } from "../../deps.ts";
import { pickReplica } from "../../helpers/pick_replica.ts";
import { getEpubMetadata } from "https://deno.land/x/epub_metadata@0.1.3/mod.ts";
import { extname } from "https://deno.land/std@0.167.0/path/mod.ts";

// First arg is the path of the epub you want to add.

// Get shared settings.
const settings = new Earthstar.SharedSettings();

// Check if there's an author.
if (!settings.author) {
  console.log(
    "You need to have an author keypair saved to settings to add a book.",
  );
  Deno.exit(1);
}

// Pick a replica
console.log("Which share would you like to add the book to?");
const replica = await pickReplica();

// Get the epub from disk
const epubPath = Deno.args[0];

if (extname(epubPath) !== ".epub") {
  console.error("Given path must end in .epub");
}

// Put this in a promise to avoid nested try/catch down the road...
const epubFilePromise = new Promise<Deno.FsFile>((res, rej) => {
  try {
    Deno.open(epubPath).then((file) => res(file));
  } catch (err) {
    rej(err);
  }
});

const epubFile = await epubFilePromise;

console.log(`✅ Opened ${epubPath}`);

// Attempt to read metadata from epub.

try {
  const metadata = await getEpubMetadata(epubFile.readable);

  const willAdd = confirm(
    `Add "${metadata.title}" by ${metadata.creators?.join(", ") || "unknown"}?`,
  );

  if (!willAdd) {
    Deno.exit(0);
  }

  const epubFileBytes = await Deno.readFile(epubPath);
  const epubHash = await Earthstar.Crypto.sha256base32(epubFileBytes);

  const result = await replica.set(settings.author, {
    text: `Epub: ${metadata.title} by ${
      metadata.creators?.join(", ") || "unknown"
    }`,
    path: `/books/~${settings.author.address}/${epubHash}/doc.epub`,
    attachment: epubFileBytes,
  });

  if (Earthstar.isErr(result)) {
    console.error(
      "Something went wrong trying to add the book to the replica:",
      result.message,
    );
    Deno.exit(1);
  } else if (result.kind === "failure") {
    console.error(
      "Something went wrong trying to add the book to the replica:",
      result.reason,
    );
    Deno.exit(1);
  }

  console.log(
    `✅ Added: ${metadata.title} by ${
      metadata.creators?.join(", ") || "unknown"
    }`,
  );
} catch {
  // Not a valid epub.
  console.log("The epub you provided couldn't be parsed for metadata!");
  Deno.exit(1);

  // TODO: Allow uploading something anyway, and let user provide metadata.
}

// Ask to sync with all known servers.
if (settings.servers.length > 0) {
  const willSync = confirm("Sync with all known servers?");

  if (!willSync) {
    Deno.exit(0);
  }

  const peer = new Earthstar.Peer();

  peer.addReplica(replica);

  const syncs = settings.servers.map((serverUrl) => {
    const syncer = peer.sync(serverUrl);

    return syncer.isDone();
  });

  await Promise.all(syncs);

  console.log(`✅ Synced with ${settings.servers.length} server(s)`);
}

await replica.close(false);

console.log("👋 Thank you!");

Deno.exit(0);
