import { Earthstar, Select } from "../deps.ts";

const settings = new Earthstar.SharedSettings();

if (settings.shares.length === 0) {
  console.log("There are no known shares to remove!");
  Deno.exit(0);
}

const choice = await Select.prompt({
  message: "Which server would you like to be forgotten?",
  options: settings.shares,
});

const isSure = confirm(
  `Are you sure you want to forget ${choice} and all its data?`,
);

if (!isSure) {
  Deno.exit(0);
}

settings.removeShare(choice);

const replica = new Earthstar.Replica({
  driver: new Earthstar.ReplicaDriverFs(
    choice,
    `./share_data/${choice}/`,
  ),
});

// Delete all the data.
await replica.close(true);

console.log("✅ Removed");

Deno.exit(0);
