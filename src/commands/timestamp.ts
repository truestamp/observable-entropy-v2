import { Command, ensureDirSync, isTooManyTries, retryAsync } from "../deps.ts";

import { writeCanonicalJSON } from "../utils.ts";

import { ENTROPY_DIR } from "../constants.ts";

export async function timestamp() {
  try {
    await retryAsync(
      async () => {
        console.log("timestamp");

        ensureDirSync(ENTROPY_DIR);
        await writeCanonicalJSON(`${ENTROPY_DIR}/timestamp.json`, {
          capturedAt: new Date().toISOString(),
        });
      },
      { delay: 1000, maxTry: 3 },
    );
  } catch (error) {
    if (isTooManyTries(error)) {
      // Did not capture after 'maxTry' calls
      console.error(`timestamp : tooManyTries : ${error.message}`);
    } else {
      console.error(`timestamp : failed : ${error.message}`);
    }
  }
}

export const timestampCommand = new Command()
  .description("Capture current UTC timestamp on script host.")
  .action(async () => {
    await timestamp();
  });
