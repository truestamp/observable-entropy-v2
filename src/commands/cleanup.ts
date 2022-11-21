import { Command } from "../deps.ts";

import { ENTROPY_DIR } from "../constants.ts";

export async function cleanup() {
  console.log("entropy : cleanup");

  try {
    await Deno.remove(ENTROPY_DIR, { recursive: true });
  } catch (_error) {
    // dir does not exist
  }
}

export const cleanupCommand = new Command()
  .description("Cleanup temporary entropy files.")
  .action(async () => {
    await cleanup();
  });
