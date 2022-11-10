import {
  canonify,
  Command,
  decodeBase64,
  encodeBase64,
  encodeHex,
  extractPublicKeyFromSecretKey,
  signEd25519,
} from "../deps.ts";

import { digestMessage, writeCanonicalJSON } from "../utils.ts";

import { ENTROPY_FILE } from "../constants.ts";

export async function sign(privKey: string) {
  console.log("sign");

  const entropy = Deno.readFileSync(ENTROPY_FILE);
  const entropyJson = JSON.parse(new TextDecoder().decode(entropy));
  const { data } = entropyJson;

  const canonicalData = await canonify(data);

  if (!canonicalData) {
    throw new Error("no canonical data");
  }

  const canonicalDataHash = await digestMessage(canonicalData);

  const privKeyBytes = decodeBase64(privKey);
  const publicKeyBytes = await extractPublicKeyFromSecretKey(privKeyBytes);
  const publicKeyBase64 = encodeBase64(publicKeyBytes);

  const canonicalDataHashSig = await signEd25519(
    privKeyBytes,
    canonicalDataHash,
  );

  const signature = {
    hash: encodeHex(canonicalDataHash, true),
    hashType: "sha-256",
    publicKey: publicKeyBase64,
    signature: encodeBase64(canonicalDataHashSig),
    signatureType: "ed25519",
  };

  await writeCanonicalJSON(ENTROPY_FILE, { ...entropyJson, ...signature });
}

export const signCommand = new Command()
  .description("Sign the entropy file.")
  .env(
    "API_SIGNING_KEY_SECRET=<value:string>",
    "Base64 encoded Ed25519 Signing private key.",
    {
      required: true,
    },
  )
  .action(async (options) => {
    await sign(options.apiSigningKeySecret);
  });
