import { google } from "@ai-sdk/google";
import { streamText, tool } from "ai";
import type { Message } from "ai";
import { z } from "zod";
import { google as googleApis } from "googleapis";
import { NextResponse } from "next/server";
import { auth } from "auth";

// Function to fetch email content using Gmail API
async function fetchEmail() {
  const session = await auth();

  if (!session?.access_token) {
    console.log("Unauthorized Access");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Set up OAuth2 client with user's access token
  const authClient = new googleApis.auth.OAuth2();
  authClient.setCredentials({ access_token: session.access_token });

  const gmail = googleApis.gmail({ version: "v1", auth: authClient });

  const messagesList = await gmail.users.messages.list({
    userId: "me",
    maxResults: 5,
    q: "is:unread category:primary -from:linkedin.com",
  });


  if (!messagesList.data.messages) {
    return "No emails found.";
  }

  const emailSummaries = [];

  // Fetch each email
  for (const message of messagesList.data.messages) {

    if (!message.id) return null;

    const email = await gmail.users.messages.get({
      userId: "me",
      id: message.id,
    });

    const parts = email.data.payload?.parts ?? [];
    let emailContent = "";

    for (const part of parts) {
      if (part.mimeType === "text/plain" && part.body?.data) {
        emailContent = Buffer.from(part.body.data, "base64").toString("utf-8");
        break;
      }
    }

    emailSummaries.push(emailContent || "No content found.");
  }

  // console.log(emailSummaries);

  return emailSummaries.join("\n\n");
}

// Tool definition for reading emails
const readEmail = tool({
  description: "Reads the last 5 emails from your inbox.",
  parameters: z.object({}),
  execute: async () => {
    return await fetchEmail();
  },
});

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: Array<Message> };

  const result = streamText({
    model: google("gemini-2.0-flash"),
    system: "You are a helpful assistant that summarizes the last 5 emails. use readEmail tool to read the emails and then summarize.",
    messages,
    tools: {
      readEmail,
    },
    maxSteps: 5,
  });

  return result.toDataStreamResponse();
}
