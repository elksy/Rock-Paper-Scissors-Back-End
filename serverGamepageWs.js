import {
  acceptWebSocket,
  acceptable,
  isWebSocketCloseEvent,
} from "https://deno.land/std@0.99.0/ws/mod.ts";

//send opp choice

const handleGamepageWs = async (server, games) => {
  const uuid = await getUserUUID(server);

  const { conn, headers, r: bufReader, w: bufWriter } = server.request;
  const ws = await acceptWebSocket({
    conn,
    headers,
    bufReader,
    bufWriter,
  }).then((ws) => handleEvent(ws, server, games, uuid));
};

async function handleEvent(ws, server, games, uuid) {
  // Handle the initial connection. Add the players ws to the sockets map and send them the initial tournament data.
  addGamesWs(ws, games, uuid);
  for await (const e of ws) {
    if (isWebSocketCloseEvent(e)) {
      games.delete(uuid);
    } else {
      const event = JSON.parse(e);
      handlePlayerMove(event, games, uuid);
    }
  }
}

async function handlePlayerMove(event, games, uuid) {
  if ("choice" in event && "opponent" in event) {
    await games
      .get(event.opponent)
      .send(JSON.stringify({ opponentChoice: event.choice }));
  }
}

async function getUserUUID(server) {
  const { sessionId } = await server.cookies;
  return sessionId;
}

async function addGamesWs(ws, games, uuid) {
  await games.set(uuid, ws);
}

export default handleGamepageWs;
