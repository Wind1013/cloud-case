import { createDocument } from "@/actions/document";
import { config } from "@/config";
import { getSession } from "@/lib/auth-client";
import { client } from "@/lib/tigris-client";
import {
  createUploadRouteHandler,
  RejectUpload,
  route,
  type Router,
} from "better-upload/server";
import z from "zod";

const router: Router = {
  client: client,
  bucketName: config.S3_BUCKET_NAME,
  routes: {
    demo: route({
      fileTypes: ["image/*"],
      multipleFiles: true,
      maxFiles: 4,
      clientMetadataSchema: z.object({
        caseId: z.string(),
      }),
      onBeforeUpload: async ({ req, files, clientMetadata }) => {
        const session = await getSession();
        const caseId = clientMetadata.caseId;

        if (!caseId) {
          throw new RejectUpload("Case id required");
        }

        if (!session) {
          throw new RejectUpload("Not logged in!");
        }

        return {
          generateObjectInfo: ({ file }) => ({ key: `${caseId}/${file.name}` }),
        };
      },
      onAfterSignedUrl: async ({ files, clientMetadata }) => {
        const { caseId } = clientMetadata;
        const promises = files.map(file =>
          createDocument({
            caseId: caseId || "cmft4fnlu0007jlgv0b2nc971",
            name: file.name,
            size: file.size,
            type: file.type,
            url: file.objectKey,
          })
        );
        await Promise.all(promises);
      },
    }),
  },
};

export const { POST } = createUploadRouteHandler(router);
