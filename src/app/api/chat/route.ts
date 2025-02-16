import { google } from "@ai-sdk/google";
import { streamText, tool } from "ai";
import type { Message } from "ai";
import { z } from "zod";
import { google as googleApis } from "googleapis";
import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { eq } from "drizzle-orm";
import { accounts } from "~/server/db/schema"; 
import { getNotes } from "~/server/actions/note";

// Function to fetch email content using Gmail API
async function fetchEmail() {
  const session = await auth();

  if (!session?.user?.id) {
    console.log("Unauthorized Access");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const account = await db.query.accounts.findFirst({
    where: eq(accounts.userId, session.user.id),
  });

  if (!account?.access_token) {
    return new Response(JSON.stringify({ error: "No access token found" }), { status: 401 });
  }

  const accessToken = account.access_token;

  console.log("Access Token: ", accessToken);

  // Set up OAuth2 client with user's access token
  const authClient = new googleApis.auth.OAuth2();
  authClient.setCredentials({ access_token: accessToken });

  console.log("Invoked ");

  const gmail = googleApis.gmail({ version: "v1", auth: authClient });

  console.log("Invoked2 ");

  let messagesList;

  try {
    console.log("Before calling Gmail API for messages list");
    messagesList = await gmail.users.messages.list({
      userId: "me",
      maxResults: 5,
      q: "is:unread category:primary -from:linkedin.com",
    });
    console.log("After calling Gmail API, response: ", messagesList.data);
  } catch (error) {
    console.error("Error fetching email list: ", error);
    const errorMessage = (error as Error).message;
    return new Response(JSON.stringify({ error: "Failed to fetch emails", details: errorMessage }), { status: 500 });
  }

  console.log("Invoked3 ");

  if (!messagesList.data.messages) {
    return "No emails found.";
  }

  console.log("Reached ", accessToken);

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

  console.log(emailSummaries);

  return emailSummaries.join("\n\n");
}

const readEmail = tool({
  description: "Reads the last 5 emails from your inbox.",
  parameters: z.object({}),
  execute: async () => {
    return await fetchEmail();
  },
});

const readNotes = tool({
  description: "Fetch all notes from the database, ordered by creation date.",
  parameters: z.object({}),
  execute: async () => {
    const allNotes = getNotes();
    return allNotes;
  },
});

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: Array<Message> };

  const result = streamText({
    model: google("gemini-2.0-flash"),
    system: `You are an efficient AI assistant designed to summarize key information.
    
    Your tasks:
    1. Retrieve the last 5 emails using the "readEmail" tool.
    2. Retrieve important notes using the "readNotes" tool.
    3. Provide a concise summary of the retrieved emails, prioritizing important details.
    4. If applicable, cross-reference the emails with existing notes to enhance the summary.
    
    Be structured, factual, and ensure clarity in your responses.`,
    messages,
    tools: {
      readEmail,
      readNotes,
    },
    maxSteps: 10,
  });

  return result.toDataStreamResponse();
}
