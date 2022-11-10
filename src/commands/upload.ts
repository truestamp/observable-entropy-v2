import { canonify, Command, S3Client } from "../deps.ts";

import { ENTROPY_FILE } from "../constants.ts";

async function upload(
  endPoint: string,
  accessKey: string,
  secretKey: string,
  bucket: string,
) {
  console.log("upload");

  const data = Deno.readFileSync(`${ENTROPY_FILE}`);
  const json = JSON.parse(new TextDecoder().decode(data));
  const canonicalJson = canonify(json);

  if (!canonicalJson) {
    throw new Error("no canonical data");
  }

  // R2 Bucket must be configured to use CORS for GET (Done with Postman for whole bucket)
  // https://developers.cloudflare.com/r2/data-access/public-buckets/#configure-cors-for-your-bucket
  // https://kian.org.uk/configuring-cors-on-cloudflare-r2/

  const s3client = new S3Client({
    endPoint,
    accessKey,
    secretKey,
    bucket,
    pathStyle: true,
    region: "auto",
  });

  const { hash } = json;

  await s3client.putObject(`${hash}.json`, canonicalJson);
  await s3client.putObject(`latest.json`, canonicalJson);
}

export const uploadCommand = new Command()
  .description("Send entropy file to Cloudflare R2.")
  .env("CF_R2_ENDPOINT=<value:string>", "Cloudflare R2 endpoint.", {
    required: true,
  })
  .env("CF_R2_ACCESS_KEY=<value:string>", "Cloudflare R2 access key.", {
    required: true,
  })
  .env("CF_R2_SECRET_KEY=<value:string>", "Cloudflare R2 secret key.", {
    required: true,
  })
  .env("CF_R2_BUCKET=<value:string>", "Cloudflare R2 bucket.", {
    required: true,
  })
  .action(async (options) => {
    await upload(
      options.cfR2Endpoint,
      options.cfR2AccessKey,
      options.cfR2SecretKey,
      options.cfR2Bucket,
    );
  });
