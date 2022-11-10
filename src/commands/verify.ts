import {
  canonify,
  Command,
  decodeBase64,
  encodeBase64,
  encodeHex,
  hash,
  verifyEd25519,
} from "../deps.ts";

import { digestMessage, fetchWithTimeout } from "../utils.ts";

import { ENTROPY_FILE } from "../constants.ts";

function generatePublicKeyHandle(publickey: Uint8Array): string {
  return encodeHex(hash(publickey)).slice(0, 8).toLowerCase();
}

async function verifyPublicKey(publickey: Uint8Array): Promise<boolean> {
  try {
    const handle = generatePublicKeyHandle(publickey);
    const keyObj = await fetchWithTimeout(
      `https://keys.truestamp.com/${handle}`,
    );

    if (!keyObj) {
      return false;
    }

    const { publicKey: foundPublicKey } = keyObj;
    if (foundPublicKey !== encodeBase64(publickey)) {
      return false;
    }

    // OK
    return true;
  } catch (error) {
    console.error(error.message);
    return false;
  }
}

async function verify(options: {
  bucketDomain: string;
  latest?: boolean;
  hash?: string;
  file?: string;
}) {
  let entropy;

  if (options.latest) {
    const url = `https://${options.bucketDomain}/latest.json`;
    entropy = await fetchWithTimeout(url);
  } else if (options.hash) {
    const url = `https://${options.bucketDomain}/${options.hash}.json`;
    entropy = await fetchWithTimeout(url);
  } else if (options.file) {
    const entropyBytes = Deno.readFileSync(ENTROPY_FILE);
    entropy = JSON.parse(new TextDecoder().decode(entropyBytes));
  } else {
    throw new Error(
      "invalid : no entropy source provided. use --latest, --hash, or --file",
    );
  }

  if (!entropy) {
    throw new Error("invalid : no entropy");
  }

  const { data, hash, publicKey, signature, signatureType } = entropy;

  if (!data) {
    throw new Error("invalid : no entropy data");
  }

  if (!hash || !publicKey || !signature || !signatureType) {
    throw new Error("invalid : missing hash or signature");
  }

  const publicKeyBytes = decodeBase64(publicKey);

  const isValidRemotePublicKey = await verifyPublicKey(publicKeyBytes);

  if (!isValidRemotePublicKey) {
    throw new Error(
      "invalid : public key verification with remote keyserver failed",
    );
  }

  const canonicalData = await canonify(data);

  if (!canonicalData) {
    throw new Error("invalid : no canonical data");
  }

  const canonicalDataHash = await digestMessage(canonicalData);

  if (hash !== encodeHex(canonicalDataHash, true)) {
    throw new Error("invalid : hash mismatch");
  }

  const signatureBytes = decodeBase64(signature);

  const isValid = verifyEd25519(
    publicKeyBytes,
    canonicalDataHash,
    signatureBytes,
  );

  if (!isValid) {
    throw new Error("invalid : bad signature");
  }

  console.log(`verify : ok : ${hash}`);
}

export const verifyCommand = new Command()
  .description("Verify an entropy file.")
  .option(
    "-b, --bucket-domain=<bucketDomain:string>",
    "The entropy storage bucket domain name.",
    {
      default: "entropy-v2.truestamp.com",
    },
  )
  .option("-H, --hash=<hash:string>", "The entropy hash to verify.", {
    conflicts: ["latest", "file"],
  })
  .option("-l, --latest", "Verify the latest entropy.", {
    conflicts: ["hash", "file"],
  })
  .option("-f, --file=<file:string>", "The local entropy file to verify.", {
    conflicts: ["hash", "latest"],
  })
  .action(async ({ bucketDomain, hash, file, latest }) => {
    await verify({ bucketDomain, hash, file, latest });
  });
