import { Earthstar, Select } from "../deps.ts";

const settings = new Earthstar.SharedSettings();

if (settings.servers.length === 0) {
  console.log("There are no known servers to remove!");
  Deno.exit(0);
}

const choice = await Select.prompt({
  message: "Which server would you like to be forgotten?",
  options: settings.servers,
});

settings.removeServer(choice);

console.log("✅ Removed");

Deno.exit(0);
