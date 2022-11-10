import { Command, ensureDirSync, isTooManyTries, retryAsync } from "../deps.ts";

import { fetchWithTimeout, writeCanonicalJSON } from "../utils.ts";

import { ENTROPY_DIR } from "../constants.ts";

export async function stellar() {
  try {
    await retryAsync(
      async () => {
        console.log("stellar");
        // Retrieve the last ledger ID.
        // curl -X GET "https://horizon.stellar.org/fee_stats" > stellar-fee-stats.json

        const feeStats = await fetchWithTimeout(
          "https://horizon.stellar.org/fee_stats",
        );

        if (feeStats.err) {
          throw new Error(`failed to fetch : status code ${feeStats.err}`);
        }

        // const { data: feeStats } = respStats

        // Read the ledger for last ledger ID
        const latestLedger = await fetchWithTimeout(
          `https://horizon.stellar.org/ledgers/${feeStats.last_ledger}`,
        );

        if (latestLedger.err) {
          throw new Error(`failed to fetch : status code ${latestLedger.err}`);
        }

        // extract just the data we want
        const { closed_at, hash, sequence } = latestLedger;
        ensureDirSync(ENTROPY_DIR);
        await writeCanonicalJSON(`${ENTROPY_DIR}/stellar.json`, {
          closed_at,
          hash,
          sequence,
        });
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
