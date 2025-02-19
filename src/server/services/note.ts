import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { auth } from "~/server/auth";
import { addNote } from "~/server/actions/note";
import { v4 as uuidv4 } from "uuid";


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

export async function createNewNote(title: string, content: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
  
    const category = await categorizeNote(content);
    const tags = await generateTags(content);
  
    await addNote({
      id: uuidv4(),
      title,
      content,
      createdById: session.user.id,
      tags,
      category,
    });
  
    return { success: true, message: "Note created successfully!", category, tags };
  }