import {
  acceptWebSocket,
  acceptable,
  isWebSocketCloseEvent,
} from "https://deno.land/std@0.99.0/ws/mod.ts";

const handleChatWs = async (server, chat) => {
  const { tournamentId } = await server.params;
  const uuid = await getUserUUID(server);
  console.log(tournamentId);
  console.log(uuid);
  const { conn, headers, r: bufReader, w: bufWriter } = server.request;
  const ws = await acceptWebSocket({
    conn,
    headers,
    bufReader,
    bufWriter,
  }).then((ws) => handleEvent(ws, chat, tournamentId, uuid));
};

async function handleEvent(ws, chat, tournamentId, uuid) {
  console.log("Handle Event");
  await addUserSocket(ws, chat, uuid, tournamentId);
  console.log(chat);
  for await (const e of ws) {
    if (isWebSocketCloseEvent(e)) {
      await chat.get(tournamentId).delete(uuid);
    } else {
      const event = JSON.parse(e);
      if ("name" in event && "message" in event) {
        chat.get(tournamentId).forEach((ws) => {
          ws.send(JSON.stringify(event));
        });
      }
    }
  }
}

async function getUserUUID(server) {
  const { sessionId } = await server.cookies;
  return sessionId;
}

async function addUserSocket(ws, chat, uuid, tournamentId) {
  await chat.get(tournamentId).set(uuid, ws);
}

export default handleChatWs;
