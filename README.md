# Server-sent events with Remix

This is a demo of a real-time chat that uses server-sent events (SSE) with Remix.

## How it works

In `app/routes/index.tsx`, we have a `useEffect` that creates a new `EventSource` to create a connection to a server-sent event endpoint. We then listen for the `message` event and update the state with the message.

The SEE endpoint is defined in `app/routes/sse.tsx`. The module is a resource route for incoming GET requests. We utilize Remix's loader function to return a Response object with the `text/event-stream` content type. We then use `ReadableStream` to create a stream of data that we can send to the client. We iteratively check for new messages and send them to the client (only if there are new messages).

Shout-out to [epeterson320](https://github.com/epeterson320) and [tylermmorton](https://github.com/tylermmorton) who showcased [working examples](https://github.com/remix-run/remix/discussions/2622) how to use a `loader` function for SSE.

## Running the demo

```sh
npm install
npm run dev
```