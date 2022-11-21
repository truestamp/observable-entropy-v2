import {
  canonify,
  Command,
  decodeBase64,
  encodeBase64,
  encodeHex,
  hash,
  verifyEd25519
} from "../deps.ts";

import { digestMessage, get } from "../utils.ts";

import { ENTROPY_BASE_URL, PUBLIC_KEYS_BASE_URL } from "../constants.ts";

import { EntropyResponse, SignedKey } from "../types.ts";

function generatePublicKeyHandle(publickey: Uint8Array): string {
  return encodeHex(hash(publickey)).slice(0, 8).toLowerCase();
}

async function verifyPublicKey(publickey: Uint8Array): Promise<boolean> {
  try {
    const handle = generatePublicKeyHandle(publickey);
    const resp: SignedKey = await get<SignedKey>(
      `${PUBLIC_KEYS_BASE_URL}/${handle}`,
    );

    const key: SignedKey = SignedKey.parse(resp);
    const { publicKey: foundPublicKey } = key;
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
  latest?: boolean;
  hash?: string;
  file?: string;
}) {
  let entropy;

  if (options.latest) {
    entropy = await get<EntropyResponse>(`${ENTROPY_BASE_URL}/latest`);
  } else if (options.hash) {
    entropy = await get<EntropyResponse>(`${ENTROPY_BASE_URL}/${options.hash}`);
  } else if (options.file) {
    const entropyBytes = Deno.readFileSync(options.file);
    entropy = JSON.parse(new TextDecoder().decode(entropyBytes));
  } else {
    throw new Error(
      "invalid : no entropy source provided. use --latest, --hash, or --file",
    );
  }

  if (!entropy) {
    throw new Error("invalid : no entropy");
  }

  const entropyParsed: EntropyResponse = EntropyResponse.parse(entropy);

  const publicKeyBytes = decodeBase64(entropyParsed.publicKey);

  const isValidRemotePublicKey = await verifyPublicKey(publicKeyBytes);

  if (!isValidRemotePublicKey) {
    throw new Error(
      "invalid : public key verification with remote keyserver failed",
    );
  }

  const canonicalData = await canonify(entropyParsed.data);

  if (!canonicalData) {
    throw new Error("invalid : no canonical data");
  }

  const canonicalDataHash = await digestMessage(canonicalData);

  if (entropyParsed.hash !== encodeHex(canonicalDataHash, true)) {
    throw new Error("invalid : hash mismatch");
  }

  const signatureBytes = decodeBase64(entropyParsed.signature);

  const isValid = verifyEd25519(
    publicKeyBytes,
    canonicalDataHash,
    signatureBytes,
  );

  if (!isValid) {
    throw new Error("invalid : bad signature");
  }

  console.log(`verify : ok : ${entropyParsed.hash}`);
}

export const verifyCommand = new Command()
  .description("Verify an entropy file.")
  .option("-H, --hash=<hash:string>", "The entropy hash to verify.", {
    conflicts: ["latest", "file"],
  })
  .option("-l, --latest", "Verify the latest entropy.", {
    conflicts: ["hash", "file"],
  })
  .option("-f, --file=<file:string>", "The local entropy file to verify.", {
    conflicts: ["hash", "latest"],
  })
  .action(async ({ hash, file, latest }) => {
    await verify({ hash, file, latest });
  });
