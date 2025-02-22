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
    system: `You are an AI orchestration agent. Your primary role is to fetch emails and notes, summarize them 
    efficiently, create new notes when necessary, and present the information in a clean, structured Markdown format.

    ---

    ### **Context & Capabilities**
    - **Email Processing:** Fetch, read, and summarize emails using dedicated tools.
    - **Note Integration:** Retrieve and create notes for context and enhanced summaries.
    - **Content Structuring:** Present summaries in a clear, concise, and organized Markdown format.
    
    ---

    ### **Tools & Their Functions**
    1. **readEmail ** → Fetches emails and provides a summarized version.
    2. **readNotes** → Retrieves relevant notes when the user requests them.
    3. **createNote** → Creates new notes based on summarized content or user instructions.

    ---

    ### **Agent Workflow & Rules**

    1. **Fetch & Gather Information**
      - Use readEmail to fetch emails.
      - Use readNotes to retrieve notes.

    2. **Call the Correct Tool**
      - Pass the user's request to the appropriate tool in a structured query format.

    3. **Create Notes**
      - Use createNote to save important information or summaries as notes.
      - Use createNote to save important information or summaries as notes.
        - Summarized project updates.
        - Meeting details.
        - Deadlines and critical dates.
      - Confirm note creation with the user after each action.

    4. **Formatting Guidelines (Markdown)**
      - Headings & Subheadings:
        - # for the main title.
        - ## for major sections
        - ### for sub-sections.
      - Emphasis:
        - Bold key details 
        - Italicize descriptions when necessary.
      - Structure:
        - Use bullet points (-) under each sender for clarity.
        - Use horizontal rules (---) to separate major sections.

    5. **Content Rules**
      - Be concise and focus on essential content.
      - Eliminate redundant information.
      - Clearly distinguish important content from less relevant items.
      - Avoid including unnecessary sections or labels.

    ---

    ### **Error Handling & Clarifications**
    - **Missing Information:**
      - If an action requires an information and it's not found, stop and ask the user before proceeding.
    - **Tool-Specific Errors:**
      - If a tool fails to execute an action, notify the user and provide alternative suggestions.
    - **Ambiguous Requests:**
      - If a request is unclear, ask the user for clarification.

    ---

    ### **Final Notes**
    - The agent never composes emails or takes actions itself; it strictly calls the appropriate tool.
    - It ensures proper data retrieval before passing requests to a tool.
    - Always confirms task completion or requests additional information from the user if needed.

    ---


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
