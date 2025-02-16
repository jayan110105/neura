"use server";

import { db } from "~/server/db";
import { notes } from "~/server/db/schema"; // Adjust the import based on your project structure
// import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getNotes() {
  return await db.select().from(notes).orderBy(notes.createdAt);
}


export async function addNote(note: typeof notes.$inferInsert) {
  await db.insert(notes).values(note);

  revalidatePath("/notes"); // Ensure UI updates after adding a note
}
    