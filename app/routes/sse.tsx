import type { LoaderArgs } from "@remix-run/node";
import { v4 } from "uuid";
import { getMessagesSince } from "~/db.server";

export async function loader({ request }: LoaderArgs) {
    const id = v4();
    const headers = new Headers();
    
    headers.set("Connection", "keep-alive");
    headers.set("Content-Type", "text/event-stream");
    headers.set("Cache-Control", "no-store, no-transform");
    
    const stream = new ReadableStream({
        async start(streamController) {
            console.log(`[${id}] Starting`);
    
            request.signal.onabort = () => {
                console.log(`[${id}] Abort Signal Received - Closing`);
                streamController.close();
            };
    
            let lastPing = new Date();
            async function pump(): Promise<void> {
                await new Promise((r) => setTimeout(r, 3000));

                const messages = await getMessagesSince(lastPing);
                // add a one second buffer to avoid missing messages
                lastPing = new Date(new Date().getTime() - 1000);
                if(messages.length > 0) {
                    console.log(`[${id}] Sending payload...`);
                    streamController.enqueue(`data: ${JSON.stringify(messages)}\n\n`);
                }
                return pump();
            }
            return pump();
        },
    });
    
    return new Response(stream, {
        headers,
        status: 200,
    });
}