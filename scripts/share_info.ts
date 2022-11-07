import { parse } from "https://deno.land/std@0.158.0/flags/mod.ts";
import { replicaFromArchive } from "../helpers/replica_archive.ts";

const { share, archivePath } = parse(Deno.args, {
  string: ["share", "docPath", "archivePath", "outputPath"],
});

if (
  !share || !archivePath
) {
  console.group("You must provide a flag for the following:");

  console.log("--share", `(you provided ${share})`);

  console.log("--archivePath", `(you provided ${archivePath})`);

  console.groupEnd();
  Deno.exit(1);
}

const tempDirPath = await Deno.makeTempDir();

const replica = await replicaFromArchive({
  shareAddress: share,
  fsDriverPath: tempDirPath,
  archivePath,
});

const allDocs = await replica.getAllDocs();
const allAuthors = await replica.queryAuthors();

let latestTimestamp = 0;

for (const doc of allDocs) {
  if (doc.timestamp > latestTimestamp) {
    latestTimestamp = doc.timestamp;
  }
}

console.group(share);
console.log("Number of docs:", allDocs.length);
console.log("Number of authors:", allAuthors.length);
console.log("Last updated:", new Date(latestTimestamp / 1000).toLocaleString());

console.groupEnd();

Deno.exit(0);
