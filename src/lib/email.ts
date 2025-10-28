import "server-only";
import { config } from "@/config";
import { Resend } from "resend";

export type SendEmailValues = {
  from?: string;
  to: string;
  subject: string;
  text: string;
};

const resend = new Resend(config.RESEND_API_KEY);

export async function sendEmail({
  from = "noreply@cloud-case.com",
  to,
  subject,
  text,
}: SendEmailValues) {
  await resend.emails.send({
    from,
    to,
    subject,
    text,
  });
}
