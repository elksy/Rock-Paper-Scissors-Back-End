import {
	acceptWebSocket,
	acceptable,
	isWebSocketCloseEvent,
} from "https://deno.land/std@0.99.0/ws/mod.ts";

const handleWebSocket = async (c) => {
	const { conn, headers, r: bufReader, w: bufWriter } = c.request;
	const ws = await acceptWebSocket({
		conn,
		headers,
		bufReader,
		bufWriter,
	});

	for await (const e of ws) {
		handleEvent(e);
		console.log(e);
		await ws.send("Hello, Client!");
	}
};

function handleEvent(e) {}

export default handleWebSocket;
