import { tool} from "ai";
import { z } from "zod";
import { auth } from "~/server/auth";
import { getNotes} from "~/server/actions/note";
import { fetchEmail } from "~/server/services/mail";
import { createNewNote } from "~/server/services/note";
import { db } from "~/server/db";
import { eq } from "drizzle-orm";
import { accounts } from "~/server/db/schema"; 

export const readEmail = tool({
    description: "Reads the last 5 emails from your inbox.",
    parameters: z.object({}),
    execute: async () => {
      const session = await auth();
      if (!session?.user?.id) throw new Error("Unauthorized");
  
      const account = await db.query.accounts.findFirst({
            where: eq(accounts.userId, session.user.id),
          });;
      if (!account?.access_token) throw new Error("No access token found");
  
      return await fetchEmail(account.access_token);
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