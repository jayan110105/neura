import { google } from "@ai-sdk/google";
import { appendResponseMessages, streamText} from "ai";
import type { Message } from "ai";
import { readEmail, readNotes, createNote } from "~/server/tools";
import { db } from "~/server/db";
import { chats} from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "~/server/auth";

export async function DELETE() {

  const session = await auth();

  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  await db.delete(chats).where(eq(chats.userId, userId));

  return NextResponse.json({ success: true });
}

export async function POST(req: Request) {

  const session = await auth();
  
  const { messages } = (await req.json()) as { messages: Array<Message> };

  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  const result = streamText({
    model: google("gemini-2.0-flash"),
    system: `You are an AI assistant that extracts and summarizes key information from emails and notes.

        ### Your Tasks:
        1. Use the **'readEmail'** tool to fetch emails and summarize them.
        2. Use the **'readNotes'** tool to get relevant notes.
        3. Summarize emails in a clean and structured format:
          - **List important emails first**.
          - **Group emails by sender.**
          - **Combine similar subjects to avoid repetition.**
          - **Do NOT include explicit "Action Items" sections.**
          - **Only list sender and summarized subject** for spam/unimportant emails at the end.

        ### Markdown Format:
          - Use **headings** and **subheadings**:
            - '#' for the main title.
            - '##' for important sections like **Important Emails** and **Unimportant/Spam Emails**.
            - '###' for subheadings like specific **senders**.
          - Use **bold** ('**') to highlight important details (e.g., amounts, dates, OTPs).
          - Use **bullet points** ('-') under each sender for clarity.
          - **Italicize** ('*') descriptions where necessary.
          - Use horizontal rules ('---') to separate major sections.

        ### Formatting:
        - Use bullet points under each sender.
        - Clearly separate important emails from unimportant/spam.
        - Remove repetitive "Subject:" prefixes.
        - Group similar emails together and number them if needed.
        - Be concise and focus on key information.

        Be concise, structured, and ensure that the final output is **Markdown-formatted** for clean rendering. Avoid unnecessary details.
    `, // Add a brief description of the system
    messages,
    tools: { readEmail, readNotes, createNote },
    maxSteps: 10,
    onFinish: async (response) => {

      const chatData = {
        userId,
        messages: JSON.stringify(appendResponseMessages({
          messages,
          responseMessages: response.response.messages,
        })),
      };

      await db
        .insert(chats)
        .values(chatData)
        .onConflictDoUpdate({
          target: chats.userId,
          set: { messages: chatData.messages, updatedAt: new Date() },
        });
    }
  });

  return result.toDataStreamResponse();
}
