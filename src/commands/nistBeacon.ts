import { Command, isTooManyTries, retryAsync } from "../deps.ts";

import { EntropyNistBeacon } from "../types.ts";
import { get, writeCanonicalJSON } from "../utils.ts";

import { ENTROPY_DIR } from "../constants.ts";

export async function nistBeacon() {
  try {
    await retryAsync(
      async () => {
        console.log("nist-beacon");

        const resp = await get<{ pulse: EntropyNistBeacon }>(
          "https://beacon.nist.gov/beacon/2.0/pulse/last",
        );

        const { pulse } = resp;
        const beacon = EntropyNistBeacon.parse(pulse);

        await writeCanonicalJSON(`${ENTROPY_DIR}/nist-beacon.json`, beacon);
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
