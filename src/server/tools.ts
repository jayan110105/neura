import { tool} from "ai";
import { z } from "zod";
import { auth } from "~/server/auth";
import { getNotes} from "~/server/actions/note";
import { fetchEmail, mailParams, summarizeEmail } from "~/server/services/mail";
import { createNewNote } from "~/server/services/note";
import { db } from "~/server/db";
import { eq } from "drizzle-orm";
import { accounts } from "~/server/db/schema"; 

export const readEmail = tool({
    description: "Fetches and summarizes emails based on user-defined criteria",
    parameters: z.object({
      userQuery: z.string().describe("Natural language query for fetching emails"),
    }),
    execute: async ({ userQuery }) => {

      console.log("userQuery", userQuery);

      const session = await auth();
      if (!session?.user?.id) throw new Error("Unauthorized");
  
      const account = await db.query.accounts.findFirst({
            where: eq(accounts.userId, session.user.id),
          });;

      if (!account?.access_token) throw new Error("No access token found");

      console.log("reached");

      const { q, maxResults } = await mailParams(userQuery);

      console.log("q", q);
      console.log("maxResults", maxResults);
  
      const emails = await fetchEmail(account.access_token, q, maxResults);

    // Process emails for output
    interface Email {
      subject: string;
      from: string;
      inReplyTo: string | null;
      content: string;
      hasAttachments: boolean;
      classification: string;
      reason?: string;
    }

    const formattedEmails = Array.isArray(emails) ? emails.map((email: Email) => {
      if (email.classification === "Important") {
        return `Subject: ${email.subject}\nFrom: ${email.from}\nIn-Reply-To: ${email.inReplyTo}\nContent: ${email.content}\nHas Attachments: ${email.hasAttachments}\nClassification: ${email.classification}\nReason: ${email.reason}`;
      } else {
        return `Subject: ${email.subject}\n From: ${email.from}\n (Classified as ${email.classification})`;
      }
    }) : ["No emails found."];

    // Join all formatted emails into a single string
    const summarized = summarizeEmail(formattedEmails.join("\n\n"));

    return summarized;
    },
  });
  
export const readNotes = tool({
    description: "Fetch all notes from the database, ordered by creation date.",
    parameters: z.object({}),
    execute: async () => {
      const session = await auth();
      return getNotes(session?.user.id ?? "");
    },
  });
  
export const createNote = tool({
    description: "Create a new note and store it in the database.",
    parameters: z.object({
      title: z.string().describe("The title of the note"),
      content: z.string().describe("The main body of the note"),
    }),
    execute: async ({title, content}) => {
      return await createNewNote(title, content);
    },
  });