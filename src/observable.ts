import { Command } from "./deps.ts";

import { bitcoinCommand } from "./commands/bitcoin.ts";

import { drandBeaconCommand } from "./commands/drandBeacon.ts";

import { ethereumCommand } from "./commands/ethereum.ts";

import { hackerNewsCommand } from "./commands/hackerNews.ts";

import { previousCommand } from "./commands/previous.ts";

import { nistBeaconCommand } from "./commands/nistBeacon.ts";

import { stellarCommand } from "./commands/stellar.ts";

import { signCommand } from "./commands/sign.ts";

import { timestampCommand } from "./commands/timestamp.ts";

import { heartbeatCommand } from "./commands/heartbeat.ts";

import { uploadCommand } from "./commands/upload.ts";

import { combineCommand } from "./commands/combine.ts";

import { cleanupCommand } from "./commands/cleanup.ts";

import { runCommand } from "./commands/run.ts";

import { verifyCommand } from "./commands/verify.ts";

const entropyCommand = new Command()
  .description("Capture and process new entropy.")
  .command("bitcoin", bitcoinCommand)
  .command("drand-beacon", drandBeaconCommand)
  .command("ethereum", ethereumCommand)
  .command("hacker-news", hackerNewsCommand)
  .command("nist-beacon", nistBeaconCommand)
  .command("previous", previousCommand)
  .command("stellar", stellarCommand)
  .command("timestamp", timestampCommand)
  .command("run", runCommand);

const adminCommand = new Command()
  .description("Entropy admin functions.")
  .command("cleanup", cleanupCommand)
  .command("combine", combineCommand)
  .command("sign", signCommand)
  .command("upload", uploadCommand)
  .command("heartbeat", heartbeatCommand);

await new Command()
  .name("observable")
  .version("0.1.0")
  .description("Capture and verify Observable Entropy.")
  .command("verify", verifyCommand)
  .command("entropy", entropyCommand)
  .command("admin", adminCommand)
  .parse(Deno.args);
