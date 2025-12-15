"use server";

import { getAuthSession } from "@/data/auth";

import { sendEmail } from "@/lib/email";

import { Appointment, User } from "@/generated/prisma";

import prisma from "@/lib/prisma";
import { buildEmailHtml } from "@/lib/email-template";

export async function sendSignInEmail({ email }: { email: string }) {
  await getAuthSession();

  const user = await prisma.user.findUnique({
    where: { email },
    select: { name: true },
  });

  const recipientName = user?.name || "Valued Client";
  const signInTimestamp = new Date().toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const text = `Dear ${recipientName},

This message confirms that your Cloud Case account was accessed successfully on ${signInTimestamp}.

If you signed in recently, no further action is required.
If you did not authorize this activity, please contact our support team immediately so we can secure your account.

Warm regards,
Cloud Case Support Team`;

  const htmlBody = `
    <p>Dear ${recipientName},</p>
    <p>This message confirms that your Cloud Case account was accessed successfully on <strong>${signInTimestamp}</strong>.</p>
    <div style="background-color:#f8fafc;padding:18px;border-radius:8px;border-left:4px solid #1d4ed8;margin:24px 0;">
      <p style="margin:0;color:#1f2937;">If this was you, no further action is required.</p>
      <p style="margin:8px 0 0;color:#1f2937;">If you did not authorize this activity, please contact our support team immediately so we can secure your account.</p>
    </div>
    <p>Warm regards,<br/>Cloud Case Support Team</p>
  `;

  await sendEmail({
    to: email,
    subject: "Successful Sign-In Notification",
    text,
    html: buildEmailHtml({
      title: "Successful Sign-In Notification",
      body: htmlBody,
    }),
  });
}

export async function sendAppointmentConfirmationEmail(
  appointment: Appointment
) {
  if (!appointment.clientId) {
    return;
  }

  const client = await prisma.user.findUnique({
    where: { id: appointment.clientId },
  });

  if (!client) {
    return;
  }

  // Get appointment creator information
  const creator = await prisma.user.findUnique({
    where: { id: appointment.createdById },
  });

  // Format dates professionally
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const startDate = new Date(appointment.startDate);
  const endDate = new Date(appointment.endDate);
  const formattedDate = formatDate(startDate);
  const startTime = formatTime(startDate);
  const endTime = formatTime(endDate);
  const appointmentType = appointment.type === "ONLINE" ? "Online" : "Face-to-Face";
  const clientName = client.firstName && client.lastName 
    ? `${client.firstName} ${client.lastName}`.trim()
    : client.name || "Valued Client";
  const creatorName = creator?.name || "Our Team";

  // Plain text version
  let text = `Dear ${clientName},

This email confirms your appointment has been scheduled.

APPOINTMENT DETAILS:

Title: ${appointment.title}
Date: ${formattedDate}
Time: ${startTime} - ${endTime}
Type: ${appointmentType}${appointment.description ? `\nDescription: ${appointment.description}` : ""}`;

  if (appointment.type === "ONLINE" && appointment.meetingUrl) {
    text += `

ZOOM MEETING LINK:
${appointment.meetingUrl}

Please use the link above to join the meeting at the scheduled time.`;
  }

  text += `

IMPORTANT REMINDERS:

${appointment.type === "ONLINE" 
  ? "• Please ensure you have a stable internet connection before the meeting\n• You may join the meeting a few minutes early to test your audio and video"
  : "• Please arrive on time for your appointment\n• If you need to reschedule or cancel, please contact us as soon as possible"}

If you have any questions or need to reschedule, please contact us at your earliest convenience.

We look forward to meeting with you.

Best regards,
${creatorName}
Cloud Case Management System

---
This is an automated confirmation email. Please do not reply directly to this message.`;

  // HTML version
  const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
    <div style="background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <h1 style="color: #2563eb; margin-top: 0; font-size: 24px; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">Appointment Confirmation</h1>
      
      <p style="font-size: 16px; margin-top: 20px;">Dear ${clientName},</p>
      
      <p style="font-size: 16px;">This email confirms your appointment has been scheduled with our office.</p>
      
      <div style="background-color: #f8f9fa; padding: 25px; border-radius: 6px; margin: 25px 0; border-left: 4px solid #2563eb;">
        <h2 style="color: #1e40af; margin-top: 0; font-size: 18px; font-weight: bold;">APPOINTMENT DETAILS</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #4b5563; width: 120px;">Title:</td>
            <td style="padding: 8px 0; color: #111827;">${appointment.title}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">Date:</td>
            <td style="padding: 8px 0; color: #111827;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">Time:</td>
            <td style="padding: 8px 0; color: #111827;">${startTime} - ${endTime}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">Type:</td>
            <td style="padding: 8px 0; color: #111827;">${appointmentType}</td>
          </tr>${appointment.description ? `
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #4b5563; vertical-align: top;">Description:</td>
            <td style="padding: 8px 0; color: #111827;">${appointment.description}</td>
          </tr>` : ""}
        </table>
      </div>

      ${appointment.type === "ONLINE" && appointment.meetingUrl ? `
      <div style="background-color: #eff6ff; padding: 25px; border-radius: 6px; margin: 25px 0; border-left: 4px solid #3b82f6;">
        <h2 style="color: #1e40af; margin-top: 0; font-size: 18px; font-weight: bold;">ZOOM MEETING LINK</h2>
        <p style="color: #1e40af; word-break: break-all; font-size: 14px; margin: 15px 0;">
          <a href="${appointment.meetingUrl}" style="color: #2563eb; text-decoration: none; font-weight: bold;">${appointment.meetingUrl}</a>
        </p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${appointment.meetingUrl}" 
             style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Join Zoom Meeting
          </a>
        </div>
        <p style="color: #4b5563; font-size: 14px; margin-top: 15px;">Please use the link above to join the meeting at the scheduled time.</p>
      </div>` : ""}

      <div style="background-color: #fef3c7; padding: 20px; border-radius: 6px; margin: 25px 0; border-left: 4px solid #f59e0b;">
        <h3 style="color: #92400e; margin-top: 0; font-size: 16px; font-weight: bold;">IMPORTANT REMINDERS</h3>
        <ul style="color: #78350f; padding-left: 20px; margin: 10px 0;">
          ${appointment.type === "ONLINE" 
            ? "<li>Please ensure you have a stable internet connection before the meeting</li><li>You may join the meeting a few minutes early to test your audio and video</li>" 
            : "<li>Please arrive on time for your appointment</li><li>If you need to reschedule or cancel, please contact us as soon as possible</li>"}
        </ul>
      </div>

      <p style="font-size: 16px; margin-top: 30px;">If you have any questions or need to reschedule, please contact us at your earliest convenience.</p>
      
      <p style="font-size: 16px; margin-top: 20px;">We look forward to meeting with you.</p>
      
      <p style="font-size: 16px; margin-top: 30px;">
        Best regards,<br>
        <strong>${creatorName}</strong><br>
        Cloud Case Management System
      </p>
      
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 40px 0 20px 0;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0; text-align: center;">
        This is an automated confirmation email. Please do not reply directly to this message.<br>
        © ${new Date().getFullYear()} Cloud Case. All rights reserved.
      </p>
    </div>
  </body>
</html>`;

  await sendEmail({
    to: client.email,
    subject: "Appointment Confirmation - Cloud Case Management",
    text,
    html,
  });
}
