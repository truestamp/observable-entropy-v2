import { Command, isTooManyTries, retryAsync } from "../deps.ts";

import { EntropyEthereum } from "../types.ts";
import { get, writeCanonicalJSON } from "../utils.ts";

import { ENTROPY_DIR } from "../constants.ts";

export async function ethereum() {
  try {
    await retryAsync(
      async () => {
        console.log("ethereum");

        const resp: EntropyEthereum = await get<EntropyEthereum>(
          "https://api.blockcypher.com/v1/eth/main",
        );

        await writeCanonicalJSON(
          `${ENTROPY_DIR}/ethereum.json`,
          EntropyEthereum.parse(resp),
        );
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
