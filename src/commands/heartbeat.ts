import { Command } from "../deps.ts";

async function heartbeat(url: string) {
  console.log("heartbeat");

  try {
    const response = await fetch(url);
    if (response?.ok) {
      console.log(`heartbeat : ok`);
    } else {
      console.error(`heartbeat : error : ${response.status}`);
    }
  } catch (error) {
    console.error(`heartbeat : error : ${error.message}`);
  }
}

export const heartbeatCommand = new Command()
  .description("Send heartbeat to monitoring service.")
  .env("HEARTBEAT_URL=<url:string>", "Monitoring heartbeat URL.", {
    required: true,
  })
  .action(async (options) => {
    await heartbeat(options.heartbeatUrl);
  });
