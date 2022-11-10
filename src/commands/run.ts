import { Command } from "../deps.ts";
import { bitcoin } from "./bitcoin.ts";
import { cleanup } from "./cleanup.ts";
import { combine } from "./combine.ts";
import { drandBeacon } from "./drandBeacon.ts";
import { ethereum } from "./ethereum.ts";
import { hackerNews } from "./hackerNews.ts";
import { nistBeacon } from "./nistBeacon.ts";
import { previous } from "./previous.ts";
import { stellar } from "./stellar.ts";
import { timestamp } from "./timestamp.ts";

async function run() {
  await cleanup();
  await previous();
  await bitcoin();
  await drandBeacon();
  await ethereum();
  await hackerNews();
  await nistBeacon();
  await stellar();
  await timestamp();
  await combine();
}

export const runCommand = new Command()
  .description("Cleanup, capture, and combine entropy files.")
  .action(async () => {
    await run();
  });
