import { pickReplica } from "../helpers/pick_replica.ts";

const replica = await pickReplica();

const allAuthors = await replica.queryAuthors();

for (const path of allAuthors) {
  console.log(path);
}

Deno.exit(0);
