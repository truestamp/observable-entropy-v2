import { canonify, crypto, Status } from "./deps.ts";

export async function digestMessage(message: string): Promise<Uint8Array> {
  const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8); // hash the message
  return new Uint8Array(hashBuffer);
}

// GET JSON from a URL with a timeout
// https://medium.com/deno-the-complete-reference/fetch-timeout-in-deno-91731bca80a1
export async function fetchWithTimeout(url: string, timeout = 5000) {
  // deno-lint-ignore no-explicit-any
  const ret: Record<string, any> = {};
  try {
    const c = new AbortController();
    const id = setTimeout(() => c.abort(), timeout);
    const res = await fetch(url, { signal: c.signal });
    clearTimeout(id);
    return await res.json();
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      ret.err = Status.RequestTimeout;
    } else ret.err = Status.ServiceUnavailable;
  }
  return ret;
}

// Write canonical JSON to a file
export async function writeCanonicalJSON(
  path: string,
  data: Record<string, unknown>,
) {
  const canonicalData = await canonify(data);
  if (!canonicalData) {
    throw new Error("no canonical data");
  }
  await Deno.writeTextFile(path, canonicalData);
}
