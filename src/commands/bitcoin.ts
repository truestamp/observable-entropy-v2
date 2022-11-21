import { Command, isTooManyTries, retryAsync } from "../deps.ts";

import { EntropyBitcoin } from "../types.ts";
import { get, writeCanonicalJSON } from "../utils.ts";

import { ENTROPY_DIR } from "../constants.ts";

export async function bitcoin() {
  try {
    await retryAsync(
      async () => {
        console.log("bitcoin");

        const resp: EntropyBitcoin = await get<EntropyBitcoin>(
          "https://blockchain.info/latestblock",
        );

        await writeCanonicalJSON(
          `${ENTROPY_DIR}/bitcoin.json`,
          EntropyBitcoin.parse(resp),
        );
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
