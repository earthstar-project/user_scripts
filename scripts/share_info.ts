import { pickReplica } from "../helpers/pick_replica.ts";

try {
  const replica = await pickReplica();

  const allDocs = await replica.getAllDocs();
  const allAuthors = await replica.queryAuthors();

  let latestTimestamp = 0;

  for (const doc of allDocs) {
    if (doc.timestamp > latestTimestamp) {
      latestTimestamp = doc.timestamp;
    }
  }

  console.group(replica.share);
  console.log("Number of docs:", allDocs.length);
  console.log("Number of authors:", allAuthors.length);
  console.log(
    "Last updated:",
    new Date(latestTimestamp / 1000).toLocaleString(),
  );

  console.groupEnd();

  Deno.exit(0);
} catch (err) {
  console.log(err);
  Deno.exit(1);
}
