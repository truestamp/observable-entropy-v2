import {
  Command,
  DrandClient,
  DrandHTTP,
  ensureDirSync,
  isTooManyTries,
  retryAsync,
} from "../deps.ts";

import { fetchWithTimeout, writeCanonicalJSON } from "../utils.ts";

import { ENTROPY_DIR } from "../constants.ts";

// Drand Beacon
// https://drand.love/developer/http-api/#public-endpoints
// https://github.com/drand/drand-client
export async function drandBeacon() {
  try {
    await retryAsync(
      async () => {
        console.log("drand-beacon");
        const urls = ["https://drand.cloudflare.com"];

        const resp = await fetchWithTimeout(
          "https://drand.cloudflare.com/info",
        );

        if (resp.err) {
          throw new Error(`failed to fetch : status code ${resp.err}`);
        }

        const chainInfo = resp;

        const options = { chainInfo };

        const client = await DrandClient.wrap(
          DrandHTTP.forURLs(urls, chainInfo.hash),
          options,
        );

        const randomness = await client.get();

        await client.close();

        ensureDirSync(ENTROPY_DIR);
        await writeCanonicalJSON(`${ENTROPY_DIR}/drand-beacon.json`, {
          chainInfo,
          randomness,
        });
      },
      { delay: 1000, maxTry: 3 },
    );
  } catch (error) {
    if (isTooManyTries(error)) {
      // Did not capture after 'maxTry' calls
      console.error(`drand : tooManyTries : ${error.message}`);
    } else {
      console.error(`drand : failed : ${error.message}`);
    }
  }
}

export const drandBeaconCommand = new Command()
  .description("Capture Drand beacon.")
  .action(async () => {
    await drandBeacon();
  });
