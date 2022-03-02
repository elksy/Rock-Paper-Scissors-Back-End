import {
  acceptWebSocket,
  acceptable,
  isWebSocketCloseEvent,
} from "https://deno.land/std@0.99.0/ws/mod.ts";
import generateRoundData from "./generateRoundData.js";
import handleGamepageWs from "./serverGamepageWs.js";

const handleWebSocket = async (
  server,
  sockets,
  userData,
  tournaments,
  tournamentInfo,
  games
) => {
  console.log(server);
  console.log(server.cookies);
  const { sessionId } = await server.cookies;
  const { tournamentId } = await server.params;
  const { conn, headers, r: bufReader, w: bufWriter } = server.request;
  const ws = await acceptWebSocket({
    conn,
    headers,
    bufReader,
    bufWriter,
  }).then((ws) =>
    handleEvent(
      ws,
      sockets,
      userData,
      sessionId,
      tournamentId,
      tournaments,
      tournamentInfo,
      games
    )
  );
};

async function handleEvent(
  ws,
  sockets,
  userData,
  uuid,
  tournamentID,
  tournaments,
  tournamentInfo,
  games
) {
  await addUserSocket(ws, sockets, uuid, tournamentID);
  for await (const e of ws) {
    if (isWebSocketCloseEvent(e)) {
      //checks to see if browser closed
      await sockets.get(tournamentID).delete(uuid);
      updatePlayersList(sockets, userData, tournamentID);
      // Send out updated list
    } else {
      const event = JSON.parse(e);
      if ("newPlayer" in event) {
        await addNewPlayerData(event, userData, uuid, tournamentID);
        await updatePlayersList(sockets, userData, tournamentID);
      } else if ("message" in event) {
        startGame(
          event,
          sockets,
          tournamentID,
          userData,
          tournaments,
          tournamentInfo,
          games
        );
      } else if ("makeLeave" in event) {
        makePlayerLeave(sockets, tournamentID, event.makeLeave);
      }
    }
  }
}
async function makePlayerLeave(sockets, tournamentID, uuid) {
  const playerWs = sockets.get(tournamentID).get(uuid);
  playerWs.send(JSON.stringify({ message: "Leave Game" }));
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
  //should this really be called get?
  const playersMap = await userData.get(tournamentID);
  const players = [];
  for (const [key, value] of playersMap) {
    players.push({
      name: value.name,
      uuid: key,
      bgColor: value.bgColor,
      textColor: value.textColor,
    });
  }
  return players;
}

async function startGame(
  event,
  sockets,
  tournamentId,
  userData,
  tournaments,
  tournamentInfo,
  games
) {
  const info = tournamentInfo.get(tournamentId);
  const tournamentData = generateRoundData(
    userData,
    tournamentId,
    info.addBots
  );
  tournaments.set(tournamentId, tournamentData);

  for (let i = 0; i < tournamentData.length; i++) {
    for (let j = 0; j < tournamentData[i].seeds.length; j++) {
      let seedMap = new Map();
      games.get(tournamentId).set(tournamentData[i].seeds[j].id, seedMap);
    }
  }

  const tournamentSockets = await sockets.get(tournamentId); // returns a Map of the sockets
  tournamentSockets.forEach((ws) => {
    ws.send(JSON.stringify({ message: "Start Game" }));
  });
}

export default handleWebSocket;
