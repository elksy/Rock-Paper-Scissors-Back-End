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
  sockets.set(uuid, { ws: ws });
  for await (const e of ws) {
    console.log(e);
    const event = JSON.parse(e);

    if (isWebSocketCloseEvent(e)) {
      //checks to see if browser closed
      sockets.delete(uuid); //removed key-value pair from map
    }
    recievedPlayerName(event, sockets, uuid);
    checkGameStart(event, sockets, uuid);

    // ws.send("Sending message");
    // console.log(sockets);
  }
}
// ws.send(JSON.stringify({ name: "rob" }));
function recievedPlayerName(event, sockets, uuid) {
  if ("name" in event) {
    const uuidData = sockets.get(uuid);
    uuidData["playerName"] = event.name;
    sockets.set(uuid, uuidData);
    const names = [];
    const keys = sockets.keys();
    for (let key of keys) {
      names.push({ name: sockets.get(key).playerName, uuid: key });
    }
    sockets.forEach((obj) => {
      obj.ws.send(JSON.stringify(names));
    });
  }
}

function checkGameStart(e, sockets, uuid) {
  if (e === "Start the game") {
    sockets.forEach((obj) => {
      obj.ws.send("Start the game");
    });
  }
}

export default handleWebSocket;
