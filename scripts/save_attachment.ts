import { Earthstar, Input } from "../deps.ts";
import { pickReplica } from "../helpers/pick_replica.ts";

try {
  const replica = await pickReplica();

  const docPath = await Input.prompt({
    message: "Choose a path",
    suggestions: await replica.queryPaths({}),
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

  const outputPath = await Input.prompt({
    message: `Choose a path to save the attachment for ${docPath} to`,
  });

  try {
    await Deno.lstat(outputPath);

    console.log(`There is already a file at ${outputPath}`);
    Deno.exit(1);
  } catch {
    // No file present, it's fine to write there.
  }

  const stream = await attachment.stream();

  const file = await Deno.open(outputPath, { create: true, write: true });

  await stream.pipeTo(file.writable);

  console.log(`Contents of ${docPath} written to ${outputPath}`);

  Deno.exit(0);
} catch (err) {
  console.error(err);
  Deno.exit(1);
}
