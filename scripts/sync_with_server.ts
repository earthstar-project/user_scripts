import * as Earthstar from "https://deno.land/x/earthstar@v10.0.0-alpha.3/mod.ts";
import { parse } from "https://deno.land/std@0.158.0/flags/mod.ts";
import {
  replicaFromArchive,
  replicaToArchive,
} from "../helpers/replica_archive.ts";

// This script syncs a share with a remote replica server, and persists the results to disk.
// If a path to an existing archive is given, it will use that.

// Parse arguments and validate their presence.
const { share, archivePath, url } = parse(Deno.args, {
  string: ["share", "archivePath", "url"],
});

if (!share || !archivePath || !url) {
  console.group("You must provide a flag for the following:");

  console.log("--share", `(you provided ${share})`);
  console.log("--archivePath", `(you provided ${archivePath})`);
  console.log("--url", `(you provided ${url})`);

  console.groupEnd();
  Deno.exit(1);
}

const tempDirPath = await Deno.makeTempDir();

const replica = await replicaFromArchive({
  shareAddress: share,
  archivePath,
  fsDriverPath: tempDirPath,
});

// Put it in a peer for syncing
const peer = new Earthstar.Peer();

peer.addReplica(replica);

// Use the fastest crypto driver available for validating incoming docs.
Earthstar.setGlobalCryptoDriver(Earthstar.CryptoDriverSodium);

console.log("Syncing...");

// Start syncing and wait until finished.
const syncer = peer.sync(url);
await syncer.isDone();

// Now zip contents and write them to the given path.
await replicaToArchive(tempDirPath, archivePath);

console.log("Cleaning up...");

await replica.close(true);

console.log("Done!");

Deno.exit(0);
