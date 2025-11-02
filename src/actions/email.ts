"use server";

import { getAuthSession } from "@/data/auth";

import { sendEmail } from "@/lib/email";

import { Appointment, User } from "@/generated/prisma";

import prisma from "@/lib/prisma";

export async function sendSignInEmail({ email }: { email: string }) {
  await getAuthSession();

  await sendEmail({
    to: email,
    subject: "Successful Sign In",
    text: "You have successfully signed in to your account.",
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

  let text = `Appointment Confirmed

  Title: ${appointment.title}
  Start Time: ${appointment.startDate}
  End Time: ${appointment.endDate}`;

  if (appointment.type === "ONLINE" && appointment.meetingUrl) {
    text += `
  Meeting Link: ${appointment.meetingUrl}`;
  }

  await sendEmail({
    to: client.email,
    subject: "Appointment Confirmation",
    text,
  });
}
