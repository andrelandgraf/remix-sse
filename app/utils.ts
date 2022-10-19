import type { Message } from "./types";

export function deserializeMessages(data: Array<any>): Message[] {
    return data.map((message) => ({
      id: message.id,
      name: message.name,
      content: message.content,
      sentAt: new Date(message.sentAt),
    }));
}

export function mergeMessages(msgs1: Message[], msgs2: Message[]): Message[] {
    // only add messages not already in the list, then sort by sentAt
    const filteredMessages = msgs1.filter(m => !msgs2.find(message => message.id === m.id));
    const mergedMessages = [...filteredMessages, ...msgs2];
    return mergedMessages.sort((a, b) => a.sentAt > b.sentAt ? 1 : -1);
}