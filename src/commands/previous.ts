import { Command, ensureDirSync, isTooManyTries, retryAsync } from "../deps.ts";

import { fetchWithTimeout, writeCanonicalJSON } from "../utils.ts";

import { ENTROPY_DIR } from "../constants.ts";

const OBSERVABLE_BASE_URL = "https://entropy-v2.truestamp.com";

export async function previous() {
  try {
    await retryAsync(
      async () => {
        console.log("previous");

        const resp = await fetchWithTimeout(
          `${OBSERVABLE_BASE_URL}/latest`,
        );
        if (resp.err) {
          throw new Error(`failed to fetch : status code ${resp.err}`);
        }

        const { hash } = resp;

        ensureDirSync(ENTROPY_DIR);
        await writeCanonicalJSON(`${ENTROPY_DIR}/previous.json`, {
          hash,
          uri: `${OBSERVABLE_BASE_URL}/${hash}`,
        });
      },
      { delay: 1000, maxTry: 3 },
    );
  } catch (error) {
    if (isTooManyTries(error)) {
      // Did not capture after 'maxTry' calls
      console.error(`previous : tooManyTries : ${error.message}`);
    } else {
      console.error(`previous : failed : ${error.message}`);
    }
  }
}

export const previousCommand = new Command()
  .description("Capture previous observable entropy hash.")
  .action(async () => {
    await previous();
  });
