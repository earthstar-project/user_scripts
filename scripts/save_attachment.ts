import * as Earthstar from "https://deno.land/x/earthstar@v10.0.0-alpha.3/mod.ts";
import { parse } from "https://deno.land/std@0.158.0/flags/mod.ts";
import { replicaFromArchive } from "../helpers/replica_archive.ts";

const { share, docPath, archivePath, outputPath } = parse(Deno.args, {
  string: ["share", "docPath", "archivePath", "outputPath"],
});

if (
  !share || !docPath || !archivePath || !outputPath
) {
  console.group("You must provide a flag for the following:");
  console.log("--share", `(you provided ${share})`);
  console.log("--docPath", `(you provided ${docPath})`);
  console.log("--archivePath", `(you provided ${archivePath})`);
  console.log("--outputPath", `(you provided ${outputPath})`);
  console.groupEnd();
  Deno.exit(1);
}

const tempDirPath = await Deno.makeTempDir();

const replica = await replicaFromArchive({
  shareAddress: share,
  fsDriverPath: tempDirPath,
  archivePath,
});

const doc = await replica.getLatestDocAtPath(docPath);

if (!doc) {
  console.log(`No document with the path ${docPath} found.`);
  Deno.exit(1);
}

const attachment = await replica.getAttachment(doc);

if (!attachment) {
  console.log(`We don't have the attachment for the document at ${docPath}`);
  Deno.exit(1);
}

if (Earthstar.isErr(attachment)) {
  console.log(`The document at ${docPath} can't have an attachment.`);
  Deno.exit(1);
}

try {
  await Deno.lstat(outputPath);

  console.log(`There is already a file at ${outputPath}`);
  Deno.exit(1);
} catch {
  // No file present, it's fine to write there.
}

const stream = await attachment.stream();

await stream.pipeTo(
  new WritableStream({
    async write(chunk) {
      await Deno.writeFile(outputPath, chunk, { append: true, create: true });
    },
  }),
);

console.log(`Contents of ${docPath} written to ${outputPath}`);

Deno.exit(0);
