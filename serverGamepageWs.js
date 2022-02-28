import {
  acceptWebSocket,
  acceptable,
  isWebSocketCloseEvent,
} from "https://deno.land/std@0.99.0/ws/mod.ts";

//send opp choice

const handleGamepageWs = async (server, games) => {
  const uuid = getUserUUID(server);

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

function handlePlayerMove(event, games, uuid) {
  if ("choice" in event && "opponent" in event) {
    console.log("sending move");
    console.log(event);
    const opp = games.get(event.opponent);
    console.log(opp);
    opp.send(event.option);
  }
}

async function getUserUUID(server) {
  const { sessionId } = await server.cookies;
  return sessionId;
}

function addGamesWs(ws, games, uuid) {
  games.set(uuid, ws);
}

export default handleGamepageWs;
