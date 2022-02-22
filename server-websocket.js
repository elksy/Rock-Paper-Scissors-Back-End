import {
	acceptWebSocket,
	acceptable,
	isWebSocketCloseEvent,
} from "https://deno.land/std@0.99.0/ws/mod.ts";
import { v4 } from "https://deno.land/std/uuid/mod.ts";

const handleWebSocket = async (c, sockets) => {
	const { conn, headers, r: bufReader, w: bufWriter } = c.request;
	const ws = await acceptWebSocket({
		conn,
		headers,
		bufReader,
		bufWriter,
	}).then((c) => handleEvent(c, sockets));

	// for await (const e of ws) {
	// 	handleEvent(e);
	// }
};

async function handleEvent(ws, sockets) {
	const uuid = v4.generate(); //generate uuid
	sockets.set(uuid, ws);
	for await (const e of ws) {
		console.log(e);

		if (isWebSocketCloseEvent(e)) {
			//checks to see if browser closed
			sockets.delete(uuid); //removed key-value pair from map
		}

		console.log(sockets);
	}
}

export default handleWebSocket;
