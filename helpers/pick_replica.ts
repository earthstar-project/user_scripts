import { Earthstar } from "../deps.ts";
import { pickShare } from "./pick_share.ts";

export async function pickReplica() {
  const shareKeypair = await pickShare();

  return new Earthstar.Replica({
    driver: new Earthstar.ReplicaDriverFs(
      shareKeypair.address,
      `./share_data/${shareKeypair.address}/`,
    ),
    shareSecret: shareKeypair.secret,
  });
}
