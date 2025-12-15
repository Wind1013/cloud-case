export function buildEmailHtml({
  title,
  body,
  footerNote = "This is an automated message. Please do not reply directly to this email.",
}: {
  title: string;
  body: string;
  footerNote?: string;
}) {
  const currentYear = new Date().getFullYear();

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.7; color: #1f2937; background-color: #f3f4f6; margin: 0; padding: 32px;">
    <div style="max-width: 640px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08); overflow: hidden;">
      <div style="background: linear-gradient(135deg, #1d4ed8, #1e40af); padding: 32px;">
        <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 600;">${title}</h1>
      </div>
      <div style="padding: 32px;">
        ${body}
        <p style="color: #6b7280; font-size: 13px; margin-top: 36px;">${footerNote}</p>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 6px;">© ${currentYear} Cloud Case. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>`;
}

