import {
  dirname,
  join,
  relative,
} from "https://deno.land/std@0.158.0/path/mod.ts";
import { Earthstar } from "../deps.ts";
import { Tar, Untar } from "https://deno.land/std@0.158.0/archive/tar.ts";
import {
  ensureDir,
  ensureFile,
  walk,
} from "https://deno.land/std@0.158.0/fs/mod.ts";
import { copy } from "https://deno.land/std@0.158.0/streams/conversion.ts";
import {} from "https://deno.land/std@0.158.0/path/mod.ts";

export async function replicaFromArchive(
  { shareAddress, archivePath, fsDriverPath, shareSecret }: {
    shareAddress: string;
    archivePath: string;
    fsDriverPath: string;
    shareSecret?: string;
  },
): Promise<Earthstar.Replica> {
  const dir = dirname(archivePath);
  await Deno.lstat(dir);

  // If there is already an archive at the path, put it in the temporary directory.
  try {
    const reader = await Deno.open(archivePath, { read: true });
    const untar = new Untar(reader);

    for await (const entry of untar) {
      if (entry.type === "directory") {
        await ensureDir(join(fsDriverPath, entry.fileName));
        continue;
      }

      await ensureFile(join(fsDriverPath, entry.fileName));
      const file = await Deno.open(join(fsDriverPath, entry.fileName), {
        write: true,
      });
      // <entry> is a reader.
      await copy(entry, file);
    }
  } catch {
    // There's no pre-existing archive, that's fine too.
    await ensureDir(join(fsDriverPath, "attachments", "staging"));
    await ensureDir(join(fsDriverPath, "attachments", "staging", "es.5"));
    await ensureDir(join(fsDriverPath, "attachments", "es.5"));
  }

  const replica = new Earthstar.Replica({
    driver: new Earthstar.ReplicaDriverFs(shareAddress, fsDriverPath),
    shareSecret,
  });

  return replica;
}

export async function replicaToArchive(
  fsDriverPath: string,
  archivePath: string,
) {
  const tar = new Tar();

  for await (const entry of walk(fsDriverPath)) {
    // Or specifying a filePath.
    if (entry.isFile) {
      const relativePath = relative(fsDriverPath, entry.path);

      await tar.append(relativePath, {
        filePath: entry.path,
      });
    }
  }

  const writer = await Deno.open(archivePath, { write: true, create: true });
  await copy(tar.getReader(), writer);
  writer.close();
}
