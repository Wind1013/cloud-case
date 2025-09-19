import { config } from "@/config";
import { getSession } from "@/lib/auth-client";
import { client } from "@/lib/tigris-client";
import {
  createUploadRouteHandler,
  RejectUpload,
  route,
  type Router,
} from "better-upload/server";

const router: Router = {
  client: client,
  bucketName: config.S3_BUCKET_NAME,
  routes: {
    demo: route({
      fileTypes: ["image/*"],
      multipleFiles: true,
      maxFiles: 4,
      onBeforeUpload: async ({ req, files, clientMetadata }) => {
        const session = await getSession();

        if (!session) {
          throw new RejectUpload("Not logged in!");
        }

        return {
          generateObjectInfo: ({ file }) => ({ key: `form/${file.name}` }),
        };
      },
    }),
  },
};

export const { POST } = createUploadRouteHandler(router);
