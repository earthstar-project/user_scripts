import { Earthstar, Input } from "../deps.ts";
import { pickReplica } from "../helpers/pick_replica.ts";

const settings = new Earthstar.ClientSettings();

if (!settings.author) {
  console.log("Can't use this script without an author keypair in settings.");
  console.log("Either add an existing keypair or generate a new one.");
  Deno.exit(1);
}

const replica = await pickReplica();

const dirPath = await Input.prompt({
  message: `Where is the directory you'd like to sync with this share?`,
});

await Earthstar.syncReplicaAndFsDir({
  replica,
  dirPath,
  keypair: settings.author,
  allowDirtyDirWithoutManifest: true,
  overwriteFilesAtOwnedPaths: true,
});

await replica.close(false);

console.log(`Synced ${replica.share} with ${dirPath}`);
