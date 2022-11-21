import { canonify, crypto, ensureDirSync } from "./deps.ts";

import { ENTROPY_DIR } from "./constants.ts";

export async function digestMessage(message: string): Promise<Uint8Array> {
  const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8); // hash the message
  return new Uint8Array(hashBuffer);
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

  ensureDirSync(ENTROPY_DIR);
  await Deno.writeTextFile(path, canonicalData);
}

// Typed Fetch w/ Timeouts
// See : https://eckertalex.dev/blog/typescript-fetch-wrapper
// See : // https://medium.com/deno-the-complete-reference/fetch-timeout-in-deno-91731bca80a1
async function http<T>(path: string, config: RequestInit): Promise<T> {
  const REQUEST_TIMEOUT = 10000; // 10 seconds

  try {
    const req = new Request(path, config);

    const c = new AbortController();
    const id = setTimeout(() => c.abort(), REQUEST_TIMEOUT);
    const res = await fetch(req, { signal: c.signal });
    clearTimeout(id);

    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }

    return res.json() as T;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error(`fetch timeout : ${err.message}`);
    } else {
      throw new Error(`fetch error : ${err.message}`);
    }
  }
}

export async function get<T>(path: string, config?: RequestInit): Promise<T> {
  const init = {
    method: "GET",
    headers: { Accept: "application/json" },
    ...config,
  };
  return await http<T>(path, init);
}

export async function post<T, U>(
  path: string,
  body: T,
  config?: RequestInit,
): Promise<U> {
  const init = {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    ...config,
  };
  return await http<U>(path, init);
}

export async function put<T, U>(
  path: string,
  body: T,
  config?: RequestInit,
): Promise<U> {
  const init = {
    method: "PUT",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    ...config,
  };
  return await http<U>(path, init);
}
