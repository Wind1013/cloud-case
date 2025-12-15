import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/data/auth";
import prisma from "@/lib/prisma";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "@/config";
import { s3Client } from "@/lib/s3-client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await getAuthSession();

    const { id } = await params;

    // Get the document from the database
    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Generate signed URL
    const command = new GetObjectCommand({
      Bucket: config.S3_BUCKET_NAME,
      Key: document.url,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour
    });

    return NextResponse.json({ signedUrl });
  } catch (error) {
    console.error("[SIGNED_URL_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to generate signed URL" },
      { status: 500 }
    );
  }
}

