import { getServerSession } from "@/lib/get-session";
import { lexicalToHtml } from "@/lib/lexical";
import prisma from "@/lib/prisma";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    console.log("PDF generation API route called."); // Log start of request

    await getServerSession();

    const { templateId, data } = await req.json();

    if (!templateId || !data) {
      console.error("Error: templateId or data missing.", { templateId, data }); // Log missing data
      return NextResponse.json(
        { error: "templateId and data are required" },
        { status: 400 }
      );
    }

    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      console.error(`Error: Template with ID ${templateId} not found.`); // Log template not found
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    let html = lexicalToHtml(template.content);

    // Replace variables
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`\\{\\{${key}\\\}\}`, "g");
      html = html.replace(regex, data[key] || "");
    });

    const isProduction = !!process.env.VERCEL;

    let browser;

    try {
      if (isProduction) {
        console.log("Launching Chromium in production environment."); // Log production launch
        const chromium = (await import("@sparticuz/chromium")).default;
        const puppeteerCore = await import("puppeteer-core");

        browser = await puppeteerCore.launch({
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath: await chromium.executablePath(),
          headless: true,
        });
      } else {
        console.log("Launching Puppeteer in development environment."); // Log development launch
        const puppeteer = await import("puppeteer");
        browser = await puppeteer.launch({
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
          headless: true,
        });
      }

      const page = await browser.newPage();
      await page.setContent(html, {
        waitUntil: "networkidle0",
        timeout: 30000,
      });

      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "20mm",
          right: "20mm",
          bottom: "20mm",
          left: "20mm",
        },
      });

      console.log("PDF generated successfully."); // Log success
      return NextResponse.json({
        pdf: Buffer.from(pdf).toString("base64"),
        filename: `${template.name.replace(/[^a-z0-9]/gi, "_")}.pdf`,
      });
    } catch (puppeteerError) {
      console.error("Error during Puppeteer operation:", puppeteerError); // Log puppeteer specific errors
      return NextResponse.json(
        { error: `PDF generation failed: ${(puppeteerError as Error).message}` },
        { status: 500 }
      );
    } finally {
      if (browser) {
        await browser.close();
        console.log("Browser closed."); // Log browser close
      }
    }
  } catch (error) {
    console.error("Unhandled error in PDF generation API:", error); // Log unhandled errors
    return NextResponse.json(
      { error: `An unexpected error occurred: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}
