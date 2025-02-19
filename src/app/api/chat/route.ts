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

export async function GET() {

  const session = await auth();

  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id; // Replace with actual user session ID

  const chat = await db.select().from(chats).where(eq(chats.userId, userId)).limit(1);

  return NextResponse.json(chat.length && chat[0]?.messages ? JSON.parse(chat[0].messages) : []);
}

export async function POST(req: Request) {

  const session = await auth();
  
  const { messages } = (await req.json()) as { messages: Array<Message> };

  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

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
    tools: { readEmail, readNotes, createNote },
    maxSteps: 10,
    onFinish: async (response) => {

      console.log(appendResponseMessages({
        messages,
        responseMessages: response.response.messages,
      }));
      
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
