import { getAuthSession } from "@/data/auth";
import { lexicalToHtml } from "@/lib/lexical-server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Handle CORS preflight requests for Brave browser compatibility
export async function OPTIONS(req: Request) {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400",
      },
    }
  );
}

export async function POST(req: Request) {
  let browser: any = null;
  let page: any = null;
  
  try {
    console.log("PDF generation API route called."); // Log start of request

    // Check authentication without redirect (API routes can't redirect)
    try {
      const { auth } = await import("@/lib/auth");
      const { headers } = await import("next/headers");
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (!session) {
        console.error("Authentication error: No session found");
        return NextResponse.json(
          { error: "Unauthorized. Please sign in to generate PDFs." },
          {
            status: 401,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "POST, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type, Authorization",
              "Access-Control-Allow-Credentials": "true",
            },
          }
        );
      }
    } catch (authError) {
      console.error("Authentication error:", authError);
      const errorMessage = authError instanceof Error ? authError.message : String(authError);
      return NextResponse.json(
        { error: `Unauthorized: ${errorMessage}` },
        { status: 401 }
      );
    }

    let requestBody;
    try {
      requestBody = await req.json();
    } catch (jsonError) {
      console.error("Error parsing request body:", jsonError);
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { templateId, data } = requestBody;

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

    let html: string;
    try {
      html = await lexicalToHtml(template.content);
    } catch (lexicalError) {
      console.error("Error converting lexical to HTML:", lexicalError);
      return NextResponse.json(
        { error: `Failed to convert template content: ${(lexicalError as Error).message}` },
        { status: 500 }
      );
    }

    // Replace variables
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`\\{\\{${key}\\\}\}`, "g");
      html = html.replace(regex, String(data[key] ?? ""));
    });

    // Calculate margins (default to 1 inch if not specified)
    const marginTop = template.marginTop ?? 1;
    const marginRight = template.marginRight ?? 1;
    const marginBottom = template.marginBottom ?? 1;
    const marginLeft = template.marginLeft ?? 1;

    // Wrap HTML in a complete document structure with proper page sizing
    const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html {
      margin: 0;
      padding: 0;
    }
    body {
      margin: 0;
      padding: ${marginTop}in ${marginRight}in ${marginBottom}in ${marginLeft}in;
      font-family: "Times New Roman", Times, serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #000;
      background: #fff;
      width: 100%;
      max-width: 100%;
      overflow: hidden;
    }
    /* Ensure all block-level content fits within page */
    p, div, h1, h2, h3, h4, h5, h6, ul, ol, blockquote, pre {
      width: 100%;
      max-width: 100%;
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-word;
      hyphens: auto;
    }
    p { 
      margin: 0.5em 0;
      text-align: left;
    }
    h1, h2, h3, h4, h5, h6 { 
      margin: 0.8em 0 0.4em 0;
      font-weight: bold;
      text-align: center;
    }
    h1 { font-size: 18pt; }
    h2 { font-size: 16pt; }
    h3 { font-size: 14pt; }
    h4, h5, h6 { font-size: 12pt; }
    table { 
      border-collapse: collapse; 
      width: 100%;
      max-width: 100%;
      margin: 1em 0;
      table-layout: fixed;
      display: table;
    }
    table td, table th { 
      border: 1px solid #ddd; 
      padding: 6px;
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-word;
      display: table-cell;
    }
    table th { 
      background-color: #f2f2f2;
      font-weight: bold;
    }
    blockquote { 
      margin: 1em 0; 
      padding-left: 1em; 
      border-left: 3px solid #ddd;
    }
    ul, ol { 
      margin: 0.5em 0; 
      padding-left: 2em;
    }
    li {
      margin: 0.25em 0;
      word-wrap: break-word;
      overflow-wrap: break-word;
      word-break: break-word;
    }
    img {
      max-width: 100%;
      height: auto;
      display: block;
    }
    pre, code {
      white-space: pre-wrap;
      word-wrap: break-word;
      overflow-wrap: break-word;
      max-width: 100%;
    }
    /* Inline elements - keep inline */
    strong, em, b, i, span {
      display: inline;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    /* Ensure no element overflows */
    * {
      box-sizing: border-box;
    }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;

    const isProduction = !!process.env.VERCEL;

    try {
      if (isProduction) {
        console.log("Launching Chromium in production environment (Vercel).");
        try {
          // Import Chromium and Puppeteer Core for serverless environment
          // @sparticuz/chromium is optimized for serverless and includes all required libraries
          const chromiumModule = await import("@sparticuz/chromium");
          const puppeteerCore = await import("puppeteer-core");
          const chromium = chromiumModule.default || chromiumModule;

          // Get Chromium executable path - this binary includes all required shared libraries
          // The executablePath() function downloads and extracts the binary if needed
          const executablePath = await chromium.executablePath();
          console.log("Chromium executable path:", executablePath);
          
          // Verify executable path exists (Chromium binary should be extracted)
          if (!executablePath) {
            throw new Error("Chromium executable path is not available. The Chromium binary may not have been extracted correctly.");
          }

          // Launch browser with Chromium's optimized configuration for serverless
          // Convert headless to proper type (boolean | "shell" | undefined)
          const headlessValue = typeof chromium.headless === "boolean" 
            ? chromium.headless 
            : chromium.headless === "shell" 
            ? "shell" 
            : true; // Default to true for serverless

          browser = await puppeteerCore.default.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath,
            headless: headlessValue,
            ignoreHTTPSErrors: true,
            timeout: 90000, // 90 second timeout for browser launch
            protocolTimeout: 180000, // 3 minute timeout for protocol operations
          });
          console.log("Browser launched successfully in production");
        } catch (importError) {
          console.error("Error importing Chromium/Puppeteer:", importError);
          const errorMessage = importError instanceof Error 
            ? importError.message 
            : typeof importError === "string" 
            ? importError 
            : JSON.stringify(importError, Object.getOwnPropertyNames(importError));
          throw new Error(`Failed to initialize PDF generator: ${errorMessage}`);
        }
      } else {
        console.log("Launching Puppeteer in development environment."); // Log development launch
        try {
        const puppeteer = await import("puppeteer");
          
          console.log("Using Puppeteer's default Chrome installation");

          // Retry logic for browser launch to handle connection issues
          let launchAttempts = 0;
          const maxAttempts = 3;
          
          while (launchAttempts < maxAttempts) {
            try {
        browser = await puppeteer.launch({
                args: [
                  "--no-sandbox",
                  "--disable-setuid-sandbox",
                  "--disable-dev-shm-usage",
                  "--disable-gpu",
                  "--disable-software-rasterizer",
                  "--disable-extensions",
                  "--disable-background-networking",
                  "--disable-background-timer-throttling",
                  "--disable-backgrounding-occluded-windows",
                  "--disable-breakpad",
                  "--disable-client-side-phishing-detection",
                  "--disable-component-update",
                  "--disable-default-apps",
                  "--disable-features=TranslateUI",
                  "--disable-hang-monitor",
                  "--disable-ipc-flooding-protection",
                  "--disable-popup-blocking",
                  "--disable-prompt-on-repost",
                  "--disable-renderer-backgrounding",
                  "--disable-sync",
                  "--disable-translate",
                  "--metrics-recording-only",
                  "--no-crash-upload",
                  "--no-default-browser-check",
                  "--no-first-run",
                  "--no-pings",
                  "--password-store=basic",
                  "--disable-web-security",
                  "--disable-features=VizDisplayCompositor",
                  "--remote-debugging-port=0", // Use random port to avoid conflicts
                  "--disable-remote-fonts", // Reduce network calls
                ],
          headless: true,
                timeout: 90000, // 90 second timeout for browser launch
                protocolTimeout: 180000, // 3 minute timeout for protocol operations
                handleSIGINT: false,
                handleSIGTERM: false,
                handleSIGHUP: false,
                pipe: true, // Use pipe instead of WebSocket for more stable connection
              });
              console.log("Browser launched successfully");
              break; // Success, exit retry loop
            } catch (launchError: any) {
              launchAttempts++;
              const isConnectionError = launchError?.message?.includes("ECONNRESET") || 
                                       launchError?.code === "ECONNRESET" ||
                                       launchError?.message?.includes("Connection closed");
              
              if (isConnectionError && launchAttempts < maxAttempts) {
                console.warn(`Browser launch attempt ${launchAttempts} failed with connection error, retrying...`);
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, 1000 * launchAttempts));
                continue;
              }
              throw launchError; // Re-throw if not a connection error or max attempts reached
            }
          }
        } catch (importError) {
          console.error("Error importing or launching Puppeteer:", importError);
          
          // Properly serialize error message
          let errorMessage: string;
          if (importError instanceof Error) {
            errorMessage = importError.message;
          } else if (typeof importError === "string") {
            errorMessage = importError;
          } else {
            // Try to extract meaningful error information
            try {
              const errorObj = importError as any;
              errorMessage = errorObj?.message || errorObj?.code || errorObj?.toString() || JSON.stringify(importError, Object.getOwnPropertyNames(importError));
            } catch {
              errorMessage = "Unknown error occurred";
            }
          }
          
          // Check for connection errors
          const isConnectionError = errorMessage.includes("ECONNRESET") || 
                                   errorMessage.includes("Connection closed") ||
                                   errorMessage.includes("ECONNREFUSED");
          
          if (isConnectionError) {
            throw new Error(
              `Browser connection error. The browser process may have crashed or been interrupted. Please try again. If the issue persists, try restarting the development server. Error: ${errorMessage}`
            );
          }
          
          // Provide helpful error message for Chrome installation
          if (errorMessage.includes("Could not find Chrome") || errorMessage.includes("executable") || errorMessage.includes("ENOENT")) {
            throw new Error(
              `Chrome browser not found. Please install Chrome for Puppeteer by running: npm run install-chrome. Error: ${errorMessage}`
            );
          }
          
          if (errorMessage.includes("Timed out") || errorMessage.includes("timeout")) {
            throw new Error(
              `Browser launch timed out. This may be due to system resources or Chrome installation issues. Please try: npm run install-chrome. Error: ${errorMessage}`
            );
          }
          
          throw new Error(`Failed to initialize PDF generator: ${errorMessage}`);
        }
      }

      if (!browser) {
        throw new Error("Browser instance not created");
      }

      try {
        page = await browser.newPage();
        
        if (!page) {
          throw new Error("Page instance not created");
        }
      
      // Set A4 viewport for accurate rendering
      await page.setViewport({
        width: 794,
        height: 1123,
      });
      
      // Set longer timeouts
      page.setDefaultNavigationTimeout(60000);
      page.setDefaultTimeout(60000);
      
      // Use setContent with a simple wait strategy
      await page.setContent(fullHtml, {
        waitUntil: "networkidle0",
        timeout: 60000,
      });
      } catch (pageError: any) {
        const isConnectionError = pageError?.message?.includes("ECONNRESET") || 
                                 pageError?.code === "ECONNRESET" ||
                                 pageError?.message?.includes("Connection closed") ||
                                 pageError?.message?.includes("Target closed") ||
                                 pageError?.message?.includes("Session closed");
        
        if (isConnectionError) {
          throw new Error(
            `Browser connection lost while creating page. The browser process may have crashed. Please try again. Error: ${pageError?.message || "Connection reset"}`
          );
        }
        throw pageError;
      }

      // Wait for rendering to complete
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Calculate margins in mm (1 inch = 25.4mm)
      const marginTopMm = (template.marginTop ?? 1) * 25.4;
      const marginRightMm = (template.marginRight ?? 1) * 25.4;
      const marginBottomMm = (template.marginBottom ?? 1) * 25.4;
      const marginLeftMm = (template.marginLeft ?? 1) * 25.4;

      let pdf: Buffer;
      try {
        pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        preferCSSPageSize: false,
        margin: {
          top: `${marginTopMm}mm`,
          right: `${marginRightMm}mm`,
          bottom: `${marginBottomMm}mm`,
          left: `${marginLeftMm}mm`,
        },
        scale: 1,
      });
      } catch (pdfError: any) {
        const isConnectionError = pdfError?.message?.includes("ECONNRESET") || 
                                 pdfError?.code === "ECONNRESET" ||
                                 pdfError?.message?.includes("Connection closed") ||
                                 pdfError?.message?.includes("Target closed") ||
                                 pdfError?.message?.includes("Session closed");
        
        if (isConnectionError) {
          throw new Error(
            `Browser connection lost while generating PDF. The browser process may have crashed. Please try again. Error: ${pdfError?.message || "Connection reset"}`
          );
        }
        throw pdfError;
      }

      console.log("PDF generated successfully."); // Log success
      
      // Close page and browser before returning
      if (page) {
        await page.close().catch((err: Error) => console.error("Error closing page:", err));
      }
      if (browser) {
        await browser.close().catch((err: Error) => console.error("Error closing browser:", err));
      }
      
      return NextResponse.json(
        {
        pdf: Buffer.from(pdf).toString("base64"),
        filename: `${template.name.replace(/[^a-z0-9]/gi, "_")}.pdf`,
        },
        {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Credentials": "true",
            "Cache-Control": "no-cache, no-store, must-revalidate",
          },
        }
      );
    } catch (puppeteerError) {
      console.error("Error during Puppeteer operation:", puppeteerError);
      const errorMessage = puppeteerError instanceof Error 
        ? puppeteerError.message 
        : typeof puppeteerError === "string" 
        ? puppeteerError 
        : JSON.stringify(puppeteerError, Object.getOwnPropertyNames(puppeteerError));
      const errorStack = puppeteerError instanceof Error ? puppeteerError.stack : undefined;
      console.error("Error stack:", errorStack);
      
      // Ensure cleanup
      try {
        if (page) {
          await page.close().catch((err: Error) => console.error("Error closing page in catch:", err));
        }
        if (browser) {
          await browser.close().catch((err: Error) => console.error("Error closing browser in catch:", err));
        }
      } catch (cleanupError) {
        console.error("Error during cleanup:", cleanupError);
      }
      
      return NextResponse.json(
        { error: `PDF generation failed: ${errorMessage}` },
        {
          status: 500,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Credentials": "true",
          },
        }
      );
    }
  } catch (error) {
    console.error("Unhandled error in PDF generation API:", error); // Log unhandled errors
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === "string" 
      ? error 
      : JSON.stringify(error, Object.getOwnPropertyNames(error));
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Error details:", {
      message: errorMessage,
      stack: errorStack,
      name: error instanceof Error ? error.name : undefined,
    });
    return NextResponse.json(
      { error: `An unexpected error occurred: ${errorMessage}` },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Credentials": "true",
        },
      }
    );
  }
}
