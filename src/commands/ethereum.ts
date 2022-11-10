import { Command, ensureDirSync, isTooManyTries, retryAsync } from "../deps.ts";

import { fetchWithTimeout, writeCanonicalJSON } from "../utils.ts";

import { ENTROPY_DIR } from "../constants.ts";

export async function ethereum() {
  try {
    await retryAsync(
      async () => {
        console.log("ethereum");

        const resp = await fetchWithTimeout(
          "https://api.blockcypher.com/v1/eth/main",
        );
        if (resp.err) {
          throw new Error(`failed to fetch : status code ${resp.err}`);
        }

        // extract just the data we want
        const { height, hash, time } = resp;
        ensureDirSync(ENTROPY_DIR);
        await writeCanonicalJSON(`${ENTROPY_DIR}/ethereum.json`, {
          height,
          hash,
          time,
        });
      },
      { delay: 1000, maxTry: 3 },
    );
  } catch (error) {
    if (isTooManyTries(error)) {
      // Did not capture after 'maxTry' calls
      console.error(`ethereum : tooManyTries : ${error.message}`);
    } else {
      console.error(`ethereum : failed : ${error.message}`);
    }
  }
}

export const ethereumCommand = new Command()
  .description("Capture Ethereum block header.")
  .action(async () => {
    await ethereum();
  });
