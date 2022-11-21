import { Command, isTooManyTries, retryAsync } from "../deps.ts";

import { EntropyStellar } from "../types.ts";
import { get, writeCanonicalJSON } from "../utils.ts";

import { ENTROPY_DIR } from "../constants.ts";

export async function stellar() {
  try {
    await retryAsync(
      async () => {
        console.log("stellar");
        // Retrieve the last ledger ID.
        // curl -X GET "https://horizon.stellar.org/fee_stats" > stellar-fee-stats.json

        const feeStats = await get<{ last_ledger: string }>(
          "https://horizon.stellar.org/fee_stats",
        );

        // Read the ledger for last ledger ID
        const latestLedger: EntropyStellar = await get<EntropyStellar>(
          `https://horizon.stellar.org/ledgers/${feeStats.last_ledger}`,
        );

        await writeCanonicalJSON(
          `${ENTROPY_DIR}/stellar.json`,
          EntropyStellar.parse(latestLedger),
        );
      },
      { delay: 1000, maxTry: 3 },
    );
  } catch (error) {
    if (isTooManyTries(error)) {
      // Did not capture after 'maxTry' calls
      console.error(`stellar : tooManyTries : ${error.message}`);
    } else {
      console.error(`stellar : failed : ${error.message}`);
    }
  }
}

export const stellarCommand = new Command()
  .description("Capture Stellar ledger header.")
  .action(async () => {
    await stellar();
  });
