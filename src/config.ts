type Config = {
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  S3_BUCKET_NAME: string;
  AWS_ENDPOINT_URL_S3: string;
  RESEND_API_KEY: string;
  ZOOM_ACCOUNT_ID: string;
  ZOOM_CLIENT_ID: string;
  ZOOM_CLIENT_SECRET: string;
};

function envOrThrow(key: string) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
}

export const config: Config = {
  AWS_ACCESS_KEY_ID: envOrThrow("AWS_ACCESS_KEY_ID"),
  AWS_SECRET_ACCESS_KEY: envOrThrow("AWS_SECRET_ACCESS_KEY"),
  S3_BUCKET_NAME: envOrThrow("S3_BUCKET_NAME"),
  AWS_ENDPOINT_URL_S3: envOrThrow("AWS_ENDPOINT_URL_S3"),
  RESEND_API_KEY: envOrThrow("RESEND_API_KEY"),
  ZOOM_ACCOUNT_ID: envOrThrow("ZOOM_ACCOUNT_ID"),
  ZOOM_CLIENT_ID: envOrThrow("ZOOM_CLIENT_ID"),
  ZOOM_CLIENT_SECRET: envOrThrow("ZOOM_CLIENT_SECRET"),
};
