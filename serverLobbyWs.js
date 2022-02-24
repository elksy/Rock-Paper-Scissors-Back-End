import {
  acceptWebSocket,
  acceptable,
  isWebSocketCloseEvent,
} from "https://deno.land/std@0.99.0/ws/mod.ts";
import { v4 } from "https://deno.land/std/uuid/mod.ts";

const handleWebSocket = async (server, sockets, userData) => {
  const uuid = getUserUUID(server);
  const { tournamentID } = await server.params;
  const { conn, headers, r: bufReader, w: bufWriter } = server.request;
  const ws = await acceptWebSocket({
    conn,
    headers,
    bufReader,
    bufWriter,
  }).then((ws) => handleEvent(ws, sockets, userData, uuid, tournamentID));
};

async function handleEvent(ws, sockets, userData, uuid, tournamentID) {
  await addUserSocket(ws, sockets, userData, uuid, tournamentID);
  for await (const e of ws) {
    if (isWebSocketCloseEvent(e)) {
      //checks to see if browser closed
      let playerSockets = await sockets.get(tournamentID);
      delete playerSockets.uuid;
      await sockets.set(tournamentID, playerSockets); //removed key-value pair from map
      // Send out updated list
    } else {
      const event = JSON.parse(e);
      if ("newPlayer" in event) {
        await addNewPlayerData(event, userData, uuid);
        updatePlayersList(sockets, userData, uuid, tournamentID);
      } else if ("startGame" in event) {
        startGame(event, sockets, tournamentID);
      }
    }
  }
}

async function addUserSocket(ws, sockets, uuid, tournamentID) {
  let tournamentSockets = await sockets.get(tournamentID);
  tournamentSockets[uuid] = ws;
  await sockets.set(tournamentID, tournamentSockets);
}

async function addNewPlayerData(event, userData, uuid, tournamentID) {
  let usersObj = userData.get(tournamentID);
  usersObj[uuid] = event.newPlayer;
  await userData.set(tournamentID, tournamentSockets);
}

function updatePlayersList(sockets, userData, tournamentID) {
  const tournamentSockets = getTournamentSockets(sockets, tournamentID); // returns an array of the sockets
  const players = getPlayersList(userData, tournamentID); // returns an array containing an objects with player data
  for (let socket of tournamentSockets) {
    socket.send(JSON.stringify({ players: players }));
  }
}

async function getTournamentSockets(sockets, tournamentID) {
  const socketsObj = sockets.get(tournamentID);
  const tournamentSockets = [];
  for (const [key, value] of Object.entries(socketsObj)) {
    tournamentSockets.push(value);
  }
  return tournamentSockets;
}

async function getPlayersList(userData, tournamentID) {
  const usersObj = userData.get(tournamentID);
  const players = [];
  for (const [key, value] of Object.entries(usersObj)) {
    players.push({ name: value.name, uuid: key });
  }
  return players;
}

function startGame(event, sockets, tournamentId) {
  const tournamentSockets = getTournamentSockets(sockets, tournamentId); // returns an array of the sockets
  for (let socket of tournamentSockets) {
    socket.send(JSON.stringify({ message: "Start Game" }));
  }
}

export default handleWebSocket;
