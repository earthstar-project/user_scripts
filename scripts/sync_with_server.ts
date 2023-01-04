import { Earthstar, Input } from "../deps.ts";
import { pickReplica } from "../helpers/pick_replica.ts";

// This script syncs a share with a remote replica server, and persists the results to disk.
// If a path to an existing archive is given, it will use that.

const replica = await pickReplica();

// Put it in a peer for syncing
const peer = new Earthstar.Peer();

peer.addReplica(replica);

console.log("Syncing...");

const settings = new Earthstar.SharedSettings();

const url = await Input.prompt({
  message: "What is the URL of the server you'd you like to sync with?",
  suggestions: settings.servers,
});

try {
  new URL(url);
} catch {
  console.error(`${url} is not a valid URL.`);
  Deno.exit(1);
}

if (!settings.servers.includes(new URL(url).toString())) {
  const willSave = confirm(`Save ${url} to favourite servers?`);

  if (willSave) {
    settings.addServer(url);
  }
}

console.log("Syncing...");

// Start syncing and wait until finished.
const syncer = peer.sync(url);

syncer.onStatusChange((newStatus) => {
  let allRequestedDocs = 0;
  let allReceivedDocs = 0;
  let allSentDocs = 0;
  let transfersInProgress = 0;

  for (const share in newStatus) {
    const shareStatus = newStatus[share];

    allRequestedDocs += shareStatus.docs.requestedCount;
    allReceivedDocs += shareStatus.docs.receivedCount;
    allSentDocs += shareStatus.docs.sentCount;

    const transfersWaiting = shareStatus.attachments.filter((transfer) => {
      return transfer.status === "ready" || transfer.status === "in_progress";
    });

    transfersInProgress += transfersWaiting.length;
  }

  console.log(
    `Syncing ${
      Object.keys(newStatus).length
    } shares, got ${allReceivedDocs}/${allRequestedDocs}, sent ${allSentDocs}, ${transfersInProgress} attachment transfers in progress.`,
  );
});

await syncer.isDone();
await replica.close(false);

console.log("Done!");

Deno.exit(0);
