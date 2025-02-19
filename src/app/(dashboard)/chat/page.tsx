'use server';

import ChatPage from '~/components/chat/ChatPage';
import type { Message } from 'ai';
import { getChatMessages } from '~/server/actions/chat'; // Adjust the import path as needed

export default async function ChatPageWrapper() {
  // Directly call the server action
  const messages: Message[] = await getChatMessages();

  return <ChatPage initialMessages={messages} />;
}
