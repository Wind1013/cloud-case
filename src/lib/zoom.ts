import axios from "axios";
import { config } from "@/config";

const { ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET, ZOOM_ACCOUNT_ID } = config;

async function getZoomAccessToken() {
  if (!ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET || !ZOOM_ACCOUNT_ID) {
    throw new Error("Zoom API credentials are not configured.");
  }

  const response = await axios.post(
    "https://zoom.us/oauth/token",
    `grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
    }
  );

  return response.data.access_token;
}

export async function createZoomMeeting(topic: string, startTime: Date) {
  const accessToken = await getZoomAccessToken();

  const response = await axios.post(
    "https://api.zoom.us/v2/users/me/meetings",
    {
      topic,
      type: 2, // Scheduled meeting
      start_time: startTime.toISOString(),
      duration: 60, // in minutes
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: true,
        watermark: false,
        use_pmi: false,
        approval_type: 0, // Automatically approve
        registration_type: 1, // No registration required
        audio: "both",
        auto_recording: "none",
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
}
