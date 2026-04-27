
'use server';

import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db';
import { message, chat } from '@/lib/db/schema';
import { eq, and, gt } from 'drizzle-orm';

export async function generateTitleFromUserMessage({
  message,
}: {
  message: string;
}) {
  const { text: title } = await generateText({
    model: openai('gpt-4o-mini'),
    system: `\n    - you will generate a short title based on the first message a user begins a conversation with\n    - ensure it is not more than 80 characters long\n    - the title should be a summary of the user's message\n    - do not use quotes or colons`,
    prompt: JSON.stringify(message),
  });

  return title;
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const session = await auth();
  if (!session?.user) return;

  const messageToDelete = await db.query.message.findFirst({
    where: eq(message.id, id),
  });

  if (!messageToDelete) return;

  await db
    .delete(message)
    .where(
      and(
        eq(message.chatId, messageToDelete.chatId),
        gt(message.createdAt, messageToDelete.createdAt),
      ),
    );

  await db.delete(message).where(eq(message.id, id));
}
