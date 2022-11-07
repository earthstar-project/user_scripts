import * as Earthstar from "https://deno.land/x/earthstar@v10.0.0-alpha.3/mod.ts";
import { parse } from "https://deno.land/std@0.158.0/flags/mod.ts";
import {
  replicaFromArchive,
  replicaToArchive,
} from "../helpers/replica_archive.ts";

// Parse arguments and validate their presence.
const { share, shareSecret, author, authorSecret, archivePath, dirPath } =
  parse(
    Deno.args,
    {
      string: [
        "share",
        "shareSecret",
        "author",
        "authorSecret",
        "archivePath",
        "dirPath",
      ],
    },
  );

if (
  !share || !shareSecret || !author || !authorSecret || !archivePath || !dirPath
) {
  console.group("You must provide a flag for the following:");

  console.log("--share", `(you provided ${share})`);
  console.log("--shareSecret", `(you provided ${shareSecret})`);
  console.log("--author", `(you provided ${author})`);
  console.log("--authorSecret", `(you provided ${authorSecret})`);
  console.log("--archivePath", `(you provided ${archivePath})`);
  console.log("--dirPath", `(you provided ${dirPath})`);

  console.groupEnd();
  Deno.exit(1);
}

const tempDirPath = await Deno.makeTempDir();

const replica = await replicaFromArchive({
  shareAddress: share,
  fsDriverPath: tempDirPath,
  archivePath,
  shareSecret,
});

await Earthstar.syncReplicaAndFsDir({
  replica,
  dirPath,
  keypair: { address: author, secret: authorSecret },
  allowDirtyDirWithoutManifest: true,
  overwriteFilesAtOwnedPaths: true,
});

// Now zip contents and write them to the given path.
await replicaToArchive(tempDirPath, archivePath);

await replica.close(true);
