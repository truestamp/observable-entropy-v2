import {
  Command,
  DrandClient,
  DrandHTTP, isTooManyTries,
  retryAsync
} from "../deps.ts";

import {
  EntropyDrandBeacon,
  EntropyDrandBeaconChainInfo,
  EntropyDrandBeaconRandomness
} from "../types.ts";
import { get, writeCanonicalJSON } from "../utils.ts";

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

        const resp: EntropyDrandBeaconChainInfo = await get<
          EntropyDrandBeaconChainInfo
        >(
          "https://drand.cloudflare.com/info",
        );

        const chainInfo: EntropyDrandBeaconChainInfo =
          EntropyDrandBeaconChainInfo.parse(resp);

        const client = await DrandClient.wrap(
          DrandHTTP.forURLs(urls, chainInfo.hash),
          { chainInfo },
        );

        const randomness = await client.get();
        await client.close();

        EntropyDrandBeaconRandomness.parse(randomness);

        const beacon: EntropyDrandBeacon = {
          chainInfo,
          randomness,
        };

        EntropyDrandBeacon.parse(beacon);

        await writeCanonicalJSON(`${ENTROPY_DIR}/drand-beacon.json`, beacon);
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
