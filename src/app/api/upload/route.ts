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
      fileTypes: [
        "image/*",
        "application/pdf",
        "application/msword", // .doc files
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx files
        "application/vnd.ms-excel", // .xls files
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx files
        "application/vnd.ms-powerpoint", // .ppt files
        "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx files
        "text/plain", // .txt files
        "application/rtf", // .rtf files
      ],
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
          generateObjectInfo: ({ file }) => ({
            key: `${caseId}/${file.name}`,
            // acl: "public-read",
          }),
        };
      },
      onAfterSignedUrl: async ({ files, clientMetadata }) => {
        const { caseId } = clientMetadata;
        const promises = files.map(file =>
          createDocument({
            caseId: caseId,
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
