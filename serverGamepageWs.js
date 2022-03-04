import {
  acceptWebSocket,
  isWebSocketCloseEvent,
} from "https://deno.land/std@0.99.0/ws/mod.ts";

// Recieves a player choice and sends it to the correct sockets.
const handleGamepageWs = async (server, games) => {
  const uuid = await getUserUUID(server);
  let { tournamentId, seedId } = await server.params;
  seedId = parseInt(seedId);
  const { conn, headers, r: bufReader, w: bufWriter } = server.request;
  const ws = await acceptWebSocket({
    conn,
    headers,
    bufReader,
    bufWriter,
  }).then((ws) => handleEvent(ws, server, games, uuid, tournamentId, seedId));
};

async function handleEvent(ws, server, games, uuid, tournamentId, seedId) {
  // Handle the initial connection. Add the players ws to the sockets map and send them the initial tournament data.
  addGamesWs(ws, games, tournamentId, seedId, uuid);
  for await (const e of ws) {
    if (isWebSocketCloseEvent(e)) {
    } else {
      const event = JSON.parse(e);
      handlePlayerMove(event, games, uuid, tournamentId, seedId);
    }
  }
}

async function getUserUUID(server) {
  const { sessionId } = await server.cookies;
  return sessionId;
}

async function addGamesWs(ws, games, tournamentId, seedId, uuid) {
  await games.get(tournamentId).get(seedId).set(uuid, ws);
}

async function handlePlayerMove(event, games, uuid, tournamentId, seedId) {
  if ("choice" in event && "player" in event) {
    const gameSockets = await games.get(tournamentId).get(seedId);
    for (let [key, value] of gameSockets.entries()) {
      if (key !== uuid) {
        value.send(
          JSON.stringify({
            move: { player: event.player, choice: event.choice },
          })
        );
      }
    }
  }
}

export default handleGamepageWs;
