"use server";

import { db } from "~/server/db";
import { notes } from "~/server/db/schema"; // Adjust the import based on your project structure
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getNotes(userId: string) {
  return await db
    .select()
    .from(notes)
    .where(eq(notes.createdById, userId)) // Filter by userId
    .orderBy(desc(notes.createdAt));
}

export async function addNote(note: typeof notes.$inferInsert) {
  await db.insert(notes).values(note);

  revalidatePath("/notes"); // Ensure UI updates after adding a note
}

export async function deleteNote(noteId: string) {
  await db.delete(notes).where(eq(notes.id, noteId));

  revalidatePath("/notes"); 
}