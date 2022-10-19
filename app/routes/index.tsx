import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useActionData, Form } from "@remix-run/react";
import { useEffect, useState } from "react";
import type { Message } from "~/types";
import { getAllMessages,  addMessage } from "~/db.server";
import { deserializeMessages, mergeMessages } from "~/utils";

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const name = formData.get("name");
  const content = formData.get("content");
  if(!content || typeof content !== "string") {
    return json({ error: "Invalid content" }, { status: 400 });
  }
  if(!name || typeof name !== "string") {
    return json({ error: "Invalid name" }, { status: 400 });
  }
  try {
    await addMessage(name, content);
    return json({}, { status: 200 });
  } catch (error) {
    return json({ error: "Failed to add message" }, { status: 500 });
  }
}

export async function loader() {
  const messages = await getAllMessages();
  return json({ messages });
}

export default function Index() {
  const actionData = useActionData();
  const data = useLoaderData<typeof loader>();
  const [messages, setMessages] = useState<Message[]>(deserializeMessages(data.messages));

  useEffect(() => {
    setMessages(deserializeMessages(data.messages));
  }, [data]);

  useEffect(() => {
    console.log('Creating a new event source object...');
    const evtSource = new EventSource("/sse");
    evtSource.onmessage = (event) => {
      const newMessages = JSON.parse(event.data);
      if(!Array.isArray(newMessages)) {
        throw new Error('Expected an array of messages');
      }
      setMessages(messages => {
        return mergeMessages(messages, deserializeMessages(newMessages));
      });
    }
    return () => {
      evtSource.close();
    }
  }, []);

  return (
    <main>
      <h1>Event Source Chat Demo</h1>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>
            <i>{message.sentAt.toLocaleString()}</i>
            <br />
            <b>{message.name}:</b>
            {" "}
            {message.content}
          </li>
        ))}
      </ul>
      <Form method="post" action="/?index">
        <div>
          <label htmlFor="name-input">Username:</label>
          <input id="name-input" type="text" name="name" />
        </div>
        <div>
          <label htmlFor="content-input">Message:</label>
          <input id="content-input" type="text" name="content" />
        </div>
        <button type="submit">Send</button>
        {
          actionData?.error && <p style={{ color: "red" }}>{actionData.error}</p>
        }
      </Form>
    </main>
  );
}
