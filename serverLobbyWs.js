import {
  acceptWebSocket,
  acceptable,
  isWebSocketCloseEvent,
} from "https://deno.land/std@0.99.0/ws/mod.ts";
import { v4 } from "https://deno.land/std/uuid/mod.ts";

const handleWebSocket = async (server, sockets, userData) => {
  const uuid = v4.generate();
  const { tournamentId } = await server.params;
  const { conn, headers, r: bufReader, w: bufWriter } = server.request;
  const ws = await acceptWebSocket({
    conn,
    headers,
    bufReader,
    bufWriter,
  }).then((ws) => handleEvent(ws, sockets, userData, uuid, tournamentId));
};

async function handleEvent(ws, sockets, userData, uuid, tournamentID) {
  await addUserSocket(ws, sockets, uuid, tournamentID);
  for await (const e of ws) {
    if (isWebSocketCloseEvent(e)) {
      //checks to see if browser closed
      await sockets.get(tournamentID).delete(uuid);
      await userData.get(tournamentID).delete(uuid);
      updatePlayersList(sockets, userData, tournamentID);
      // Send out updated list
    } else {
      const event = JSON.parse(e);
      if ("newPlayer" in event) {
        await addNewPlayerData(event, userData, uuid, tournamentID);
        await updatePlayersList(sockets, userData, tournamentID);
      } else if ("message" in event) {
        startGame(event, sockets, tournamentID);
      }
    }
  }
}

async function addUserSocket(ws, sockets, uuid, tournamentID) {
  await sockets.get(tournamentID).set(uuid, ws);
}

async function addNewPlayerData(event, userData, uuid, tournamentID) {
  await userData.get(tournamentID).set(uuid, event.newPlayer);
}

async function updatePlayersList(sockets, userData, tournamentID) {
  const tournamentSockets = await sockets.get(tournamentID); // returns a Map of the sockets
  const players = await getPlayersList(userData, tournamentID); // returns an array containing an objects with player data
  tournamentSockets.forEach((ws) => {
    ws.send(JSON.stringify({ players: players }));
  });
}

async function getPlayersList(userData, tournamentID) {
  const playersMap = await userData.get(tournamentID);
  const players = [];
  for (const [key, value] of playersMap) {
    players.push({ name: value.name, uuid: key });
  }
  return players;
}

async function startGame(event, sockets, tournamentId) {
  const tournamentSockets = await sockets.get(tournamentId); // returns a Map of the sockets
  tournamentSockets.forEach((ws) => {
    ws.send(JSON.stringify({ message: "Start Game" }));
  });
}

export default handleWebSocket;
