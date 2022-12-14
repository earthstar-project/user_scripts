# Earthstar Scripts

A collection of [Earthstar](https://earthstar-project.org) scripts for reading,
writing, syncing, and archiving share data.

It's like a CLI, but better: you can read, modify, and extend the available
scripts so they're just the way you want them.

All these scripts pull their settings from the same source, so you can reuse a
keypair and all your favourite shares and servers between them.

All share replica data is persisted to the filesystem in `share_data`.

## Set up

1. Clone this repository
2. Install the Deno runtime
   ([Instructions](https://deno.land/manual@v1.28.3/getting_started/installation))
3. Test it all works with `deno run scripts/new_author.ts suzy`

## Available scripts

### `add_share.ts`

Adds an existing share to the shared settings so that other scripts can use it.

### `archive_share.ts`

Archives a share replica's data to a zip file. You can then put that archive on
a USB key and give it to a friend for syncing, or back it up.

### `list_authors.ts`

Lists all authors from a share replica.

### `list_paths.ts`

Lists all document paths from a share replica.

### `new_author.ts`

Generates a new author keypair from a shortname and adds it to shared settings
for other scripts to use.

### `new_share.ts`

Generates a new share keypair from a name and adds it to shared settings for
other scripts to use.

### `save_attachment.ts`

Write an attachment to your filesystem.

### `set_author.ts`

Take an existing author keypair and save it to the shared settings for other
scripts to use.

### `share_info.ts`

Prints some info about a share replica.

### `sync_archive.ts`

Takes a zipped share archive, and syncs it with our own data for that share.
Optionally updates the zipped archive. Useful for when you get that USB key from
your friend.

### `sync_dir.ts`

Sync the contents of a filesystem directory with a share replica.

### `sync_with_server.ts`

Sync a share replica with an Earthstar server.

### `write_replica`

Write some data to a share replica with free-form text or a file on the
filesystem.
