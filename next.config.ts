import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  outputFileTracingIncludes: {
    "/api/generate-pdf": [
      "./node_modules/@sparticuz/chromium/bin/chromium",
      "./node_modules/@sparticuz/chromium/bin/chromium/**/*",
      "./node_modules/@sparticuz/chromium/lib/**/*",
    ],
  },
};

export default nextConfig;
