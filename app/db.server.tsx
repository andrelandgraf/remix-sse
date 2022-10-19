import fs from 'fs/promises';
import path from 'path';
import { v4  } from "uuid";
import type { Message } from './types';
import { deserializeMessages } from './utils';

/*
 * Gets all messages from db.json "database".
 */
export async function getAllMessages(): Promise<Message[]> {
    const fileContents = await fs.readFile(path.join(process.cwd(), 'db.json'), 'utf-8');
    const data = JSON.parse(fileContents);
    return deserializeMessages(data.messages);
}

/*
 * Adds a message to the db.json "database".
 */
export async function addMessage(name: string, content: string) {
    const message: Message = { id: v4(), content, name, sentAt: new Date() };
    const fileContents = await fs.readFile(path.join(process.cwd(), 'db.json'), 'utf-8');
    const data = JSON.parse(fileContents);
    data.messages.push(message);
    await fs.writeFile(path.join(process.cwd(), 'db.json'), JSON.stringify(data, null, 2));
}

/*
 * Gets all messages from db.json "database" since the given date.
 */
export async function getMessagesSince(since: Date): Promise<Message[]> {
    const messages = await getAllMessages();
    const filteredMessages = messages.filter((message) => message.sentAt > since)
    return filteredMessages;
}