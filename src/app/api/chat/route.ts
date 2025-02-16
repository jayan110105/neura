import { google } from "@ai-sdk/google";
import { streamText, tool, generateObject } from "ai";
import type { Message } from "ai";
import { z } from "zod";
import { google as googleApis } from "googleapis";
import { NextResponse } from "next/server";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { eq } from "drizzle-orm";
import { accounts } from "~/server/db/schema"; 
import { getNotes, addNote } from "~/server/actions/note";
import { v4 as uuidv4 } from "uuid";

// Function to fetch email content using Gmail API
const CategorySchema = z.object({
  category: z.enum(["work", "personal", "ideas", "tasks"]).describe("The assigned category for the note."),
});

const TagsSchema = z.object({
  tags: z.array(z.string()).min(1).max(5).describe("A list of relevant keywords for the note."),
});

// Function to categorize a note using structured AI output
export async function categorizeNote(content: string): Promise<"work" | "personal" | "ideas" | "tasks"> {
  const response = await generateObject({
    model: google("gemini-2.0-flash"),
    schema: CategorySchema,
    system: `Analyze the provided note content and categorize it into one of the following: "work", "personal", "ideas", or "tasks".
    Return a structured JSON object matching this schema.`,
    messages: [{ role: "user", content }],
  });

  return response.object.category;
}

// Function to generate structured tags based on note content
export async function generateTags(content: string): Promise<string[]> {
  const response = await generateObject({
    model: google("gemini-2.0-flash"),
    schema: TagsSchema,
    system: `Extract between 1 to 5 relevant keywords that best describe the provided note content.
    Return a structured JSON object matching this schema.`,
    messages: [{ role: "user", content }],
  });

  return response.object.tags;
}

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

export const createNote = tool({
  description: "Create a new note and store it in the database.",
  parameters: z.object({
    title: z.string().describe("The title of the note for quick reference."),
    content: z.string().describe("The main body of the note containing detailed information."),
  }),
  execute: async ({title, content}) => {
    const session = await auth();

    if (!session?.user?.id) {
      console.log("Unauthorized Access");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = uuidv4();
    const createdById = session.user.id;

    const category = await categorizeNote(content);
    const tags = await generateTags(content);

    await addNote({ id, title, content, createdById, tags, category });
    return {
      success: true,
      message: "Note created successfully!",
      category,
      tags,
    };
  },
});

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: Array<Message> };

  const result = streamText({
    model: google("gemini-2.0-flash"),
    system: `You are an intelligent AI assistant designed to efficiently extract and summarize key information from emails and notes.
      ### Your Responsibilities:
      1. Retrieve the **last 5 emails** using the 'readEmail' tool.
      2. Retrieve **relevant notes** stored in the database using the 'readNotes' tool.
      3. Generate a **clear and concise summary** of the retrieved emails, highlighting important details such as:
        - Key topics and decisions
        - Actionable tasks
        - Critical information
      4. If applicable, **cross-reference** emails with existing notes to provide a more contextual and insightful summary.
      5. Maintain a **structured, factual, and easy-to-read format** in your responses.

      ### Formatting Guidelines:
      - **Use bullet points or numbered lists** for clarity.
      - **Keep summaries concise** while ensuring completeness.
      - **Highlight action items** where necessary.

      Your goal is to help users quickly grasp important information without unnecessary details. Be **precise, structured, and efficient** in your responses.
      `, // Add a brief description of the system
    messages,
    tools: {
      readEmail,
      readNotes,
      createNote,
    },
    maxSteps: 10,
  });

  return result.toDataStreamResponse();
}
