import { config } from "@/config";
import { tigris } from "better-upload/server/helpers";

export const client = tigris({
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  endpoint: config.AWS_ENDPOINT_URL_S3,
});
