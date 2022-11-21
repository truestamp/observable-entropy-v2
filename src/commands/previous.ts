import { Command, isTooManyTries, retryAsync } from "../deps.ts";

import { EntropyPrevious, EntropyResponse } from "../types.ts";
import { get, writeCanonicalJSON } from "../utils.ts";

import { ENTROPY_DIR } from "../constants.ts";

const OBSERVABLE_BASE_URL = "https://entropy-v2.truestamp.com";

export async function previous() {
  try {
    await retryAsync(
      async () => {
        console.log("previous");

        const resp: EntropyResponse = await get<EntropyResponse>(
          `${OBSERVABLE_BASE_URL}/latest`,
        );

        EntropyResponse.parse(resp);

        const { hash } = resp;

        const previous: EntropyPrevious = EntropyPrevious.parse({
          hash,
          uri: `${OBSERVABLE_BASE_URL}/${hash}`,
        });

        await writeCanonicalJSON(`${ENTROPY_DIR}/previous.json`, previous);
      },
      { delay: 1000, maxTry: 3 },
    );
  } catch (error) {
    if (isTooManyTries(error)) {
      // Did not capture after 'maxTry' calls
      console.error(`previous : tooManyTries : ${error.message}`);
    } else {
      console.error(`previous : failed : ${error.message}`);
    }
  }
}

export const previousCommand = new Command()
  .description("Capture previous observable entropy hash.")
  .action(async () => {
    await previous();
  });
