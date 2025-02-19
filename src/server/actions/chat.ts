'use server';

import { auth } from '~/server/auth'; // Adjust path as needed
import { db } from '~/server/db';     // Adjust path as needed
import { chats } from '~/server/db/schema'; // Assuming you're using drizzle or similar ORM
import { eq } from 'drizzle-orm';  // Replace based on ORM you're using
import type { Message } from 'ai';

export async function getChatMessages() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    const chat = await db
      .select()
      .from(chats)
      .where(eq(chats.userId, userId))
      .limit(1);

    const messages: Message[] = chat.length && chat[0]?.messages ? JSON.parse(chat[0].messages) as Message[]: [];

    return messages;
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    throw new Error('Failed to fetch chat messages');
  }
}
