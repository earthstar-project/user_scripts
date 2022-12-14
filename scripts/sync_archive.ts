import { ensureDir } from "https://deno.land/std@0.167.0/fs/mod.ts";
import { walk } from "https://deno.land/std@0.167.0/fs/walk.ts";
import { join } from "https://deno.land/std@0.167.0/path/mod.ts";
import {
  ZipReader,
  ZipWriter,
} from "https://deno.land/x/zipjs@v2.6.60/index.js";
import { Earthstar } from "../deps.ts";

const archivePath = Deno.args[0];

// Unzip
const zipFile = await Deno.open(archivePath, { read: true });

const zipReader = new ZipReader(zipFile.readable);

const tempDir = await Deno.makeTempDir();

let shareName;

for await (const entry of zipReader.getEntriesGenerator()) {
  const pathToWriteTo = join(tempDir, entry.filename);

  if (!shareName) {
    shareName = entry.filename.split("/")[0];
  }

  if (entry.directory) {
    await ensureDir(pathToWriteTo);
    continue;
  }

  const file = await Deno.open(pathToWriteTo, { create: true, write: true });

  await entry.getData(file.writable);
}

await zipReader.close();

console.log("derived name", shareName);

// Derive share name from unzipped contents.

// Create a new replica with unzipped contents
const zipReplica = new Earthstar.Replica({
  driver: new Earthstar.ReplicaDriverFs(
    shareName as string,
    join(tempDir, shareName as string),
  ),
});

// Sync it with new replica with data in share_data
const ourReplica = new Earthstar.Replica({
  driver: new Earthstar.ReplicaDriverFs(
    shareName as string,
    `./share_data/${shareName}`,
  ),
});

const peerA = new Earthstar.Peer();
peerA.addReplica(zipReplica);

const peerB = new Earthstar.Peer();
peerB.addReplica(ourReplica);

const syncer = peerA.sync(peerB);

console.log("Syncing...");
await syncer.isDone();
console.log("Done.");

const shouldModifyZip = confirm(
  `Overwrite ${archivePath} with freshly synced archive?`,
);

if (shouldModifyZip) {
  const zipFile2 = await Deno.open(archivePath, {
    write: true,
    truncate: true,
  });

  const zipWriter = new ZipWriter(zipFile2.writable);

  for await (const entry of walk(join(tempDir, shareName as string))) {
    const pathBits = entry.path.split("/");

    const indexOfShare = pathBits.indexOf(shareName as string);
    const newPathBits = pathBits.slice(indexOfShare);
    const newPath = join(...newPathBits);

    if (entry.isDirectory) {
      await zipWriter.add(newPath, undefined, { directory: true });
      continue;
    }

    const file = await Deno.open(entry.path, { read: true });

    await zipWriter.add(newPath, file.readable);
  }

  await zipWriter.close();

  console.log(`Updated ${archivePath}`);
}

// Clean up zip replica
await zipReplica.close(true);
await ourReplica.close(false);
await Deno.remove(tempDir, {
  recursive: true,
});
