import { S3Client } from "@aws-sdk/client-s3";
import { config } from "@/config";

// Create AWS S3 client for generating signed URLs
// This works with AWS S3, Tigris, MinIO, and other S3-compatible services
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1", // Default region, can be configured via env
  credentials: {
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
  },
  endpoint: config.AWS_ENDPOINT_URL_S3,
  forcePathStyle: true, // Required for S3-compatible services like Tigris and MinIO
  // Disable SSL verification for local development (MinIO)
  ...(process.env.AWS_ENDPOINT_URL_S3?.includes("localhost") && {
    tls: false,
  }),
});

