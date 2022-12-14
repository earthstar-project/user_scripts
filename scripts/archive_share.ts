import { Earthstar, Input } from "../deps.ts";
import { pickShare } from "../helpers/pick_share.ts";
import { ZipWriter } from "https://deno.land/x/zipjs@v2.6.60/index.js";
import { walk } from "https://deno.land/std@0.167.0/fs/mod.ts";
import { join } from "https://deno.land/std@0.167.0/path/mod.ts";

const share = await pickShare();

const parsed = Earthstar.parseShareAddress(
  share.address,
) as Earthstar.ParsedAddress;

const outputPath = await Input.prompt({
  message: "Where would you like to save the share archive to?",

  default: `./${parsed.name}.zip`,
});

const zipFile = await Deno.open(outputPath, {
  create: true,
  write: true,
  truncate: true,
});

const zipWriter = new ZipWriter(zipFile.writable);

for await (const entry of walk(`./share_data/${share.address}`)) {
  const [, ...rest] = entry.path.split("/");

  const newPath = join(...rest);

  if (entry.isDirectory) {
    await zipWriter.add(newPath, undefined, { directory: true });

    continue;
  }

  const file = await Deno.open(entry.path, { read: true });

  await zipWriter.add(newPath, file.readable);
}

await zipWriter.close();

console.log(`Archived share to ${outputPath}`);
