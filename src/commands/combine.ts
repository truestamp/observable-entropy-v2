import { Command } from "../deps.ts";

import { writeCanonicalJSON } from "../utils.ts";

import { ENTROPY_DIR, ENTROPY_FILE } from "../constants.ts";

function entropyGetDirFiles(): string[] {
  const files: string[] = [];

  // capture the '.json' files from dir
  for (const dirEntry of Deno.readDirSync(ENTROPY_DIR)) {
    if (dirEntry.isFile && dirEntry.name.endsWith(".json")) {
      files.push(dirEntry.name);
    }
  }

  return files;
}

export async function combine() {
  console.log("entropy : combine");

  const files = entropyGetDirFiles();
  const entropy: { data: Record<string, string | number> } = { data: {} };
  for (const file of files) {
    const data = Deno.readFileSync(`${ENTROPY_DIR}/${file}`);
    const json = JSON.parse(new TextDecoder().decode(data));
    entropy["data"][file.replace(".json", "")] = json;
  }

  await writeCanonicalJSON(ENTROPY_FILE, entropy);
}

export const combineCommand = new Command()
  .description("Combine all captured entropy into a single entropy file.")
  .action(async () => {
    await combine();
  });
