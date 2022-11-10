import { Command, ensureDirSync, isTooManyTries, retryAsync } from "../deps.ts";

import { fetchWithTimeout, writeCanonicalJSON } from "../utils.ts";

import { ENTROPY_DIR } from "../constants.ts";

export async function nistBeacon() {
  try {
    await retryAsync(
      async () => {
        console.log("nist-beacon");

        const beacon = await fetchWithTimeout(
          "https://beacon.nist.gov/beacon/2.0/pulse/last",
        );

        if (beacon.err) {
          throw new Error(`failed to fetch : status code ${beacon.err}`);
        }

        const { pulse } = beacon;
        const { chainIndex, outputValue, pulseIndex, timeStamp, uri } = pulse;

        ensureDirSync(ENTROPY_DIR);
        await writeCanonicalJSON(`${ENTROPY_DIR}/nist-beacon.json`, {
          chainIndex,
          outputValue,
          pulseIndex,
          timeStamp,
          uri,
        });
      },
      { delay: 1000, maxTry: 3 },
    );
  } catch (error) {
    if (isTooManyTries(error)) {
      // Did not capture after 'maxTry' calls
      console.error(`nist-beacon : tooManyTries : ${error.message}`);
    } else {
      console.error(`nist-beacon : failed : ${error.message}`);
    }
  }
}

export const nistBeaconCommand = new Command()
  .description("Capture NIST Randomness beacon.")
  .action(async () => {
    await nistBeacon();
  });
