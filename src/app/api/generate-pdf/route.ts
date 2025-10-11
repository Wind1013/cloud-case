import { getServerSession } from "@/lib/get-session";
import { lexicalToHtml } from "@/lib/lexical";
import prisma from "@/lib/prisma";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await getServerSession();

    const { templateId, data } = await req.json();

    if (!templateId || !data) {
      return NextResponse.json(
        { error: "templateId and data are required" },
        { status: 400 }
      );
    }

    const template = await prisma.template.findUnique({
      where: { id: templateId },
    });

    if (!template) {
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
        const chromium = (await import("@sparticuz/chromium")).default;
        const puppeteerCore = await import("puppeteer-core");

        browser = await puppeteerCore.launch({
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath: await chromium.executablePath(),
          headless: true,
        });
      } else {
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

      return NextResponse.json({
        pdf: Buffer.from(pdf).toString("base64"),
        filename: `${template.name.replace(/[^a-z0-9]/gi, "_")}.pdf`,
      });
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
