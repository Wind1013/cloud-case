import { getCaseById } from "@/data/cases";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await getCaseById(id);

    if (!result.success || !result.data) {
      return NextResponse.json(
        { error: result.error || "Case not found" },
        { status: 404 }
      );
    }

    // Return only the documents
    return NextResponse.json({
      success: true,
      documents: result.data.documents || [],
    });
  } catch (error) {
    console.error("Error fetching case documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

