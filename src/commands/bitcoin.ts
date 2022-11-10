import { Command, ensureDirSync, isTooManyTries, retryAsync } from "../deps.ts";

import { fetchWithTimeout, writeCanonicalJSON } from "../utils.ts";

import { ENTROPY_DIR } from "../constants.ts";

export async function bitcoin() {
  try {
    await retryAsync(
      async () => {
        console.log("bitcoin");

        const resp = await fetchWithTimeout(
          "https://blockchain.info/latestblock",
        );

        if (resp.err) {
          throw new Error(`failed to fetch : status code ${resp.err}`);
        }

        // extract just the data we want
        const { height, hash, time, block_index: blockIndex } = resp;
        ensureDirSync(ENTROPY_DIR);
        await writeCanonicalJSON(`${ENTROPY_DIR}/bitcoin.json`, {
          height,
          hash,
          time,
          blockIndex,
        });
      },
      { delay: 1000, maxTry: 3 },
    );
  } catch (error) {
    if (isTooManyTries(error)) {
      // Did not capture after 'maxTry' calls
      console.error(`bitcoin : tooManyTries : ${error.message}`);
    } else {
      console.error(`bitcoin : failed : ${error.message}`);
    }
  }
}

export const bitcoinCommand = new Command()
  .description("Capture Bitcoin block header.")
  .action(async () => {
    await bitcoin();
  });
