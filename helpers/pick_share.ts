import { Earthstar, Select } from "../deps.ts";

export async function pickShare(): Promise<{
  address: string;
  secret: string | undefined;
}> {
  const settings = new Earthstar.SharedSettings();

  if (settings.shares.length === 0) {
    throw "No known shares.";
  }

  const share = await Select.prompt({
    message: "Pick a share",
    options: settings.shares,
  });

  return { address: share, secret: settings.shareSecrets[share] };
}
