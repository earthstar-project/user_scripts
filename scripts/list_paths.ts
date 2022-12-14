import { pickReplica } from "../helpers/pick_replica.ts";

const replica = await pickReplica();

const allPaths = await replica.queryPaths();

for (const path of allPaths) {
  console.log(path);
}

Deno.exit(0);
