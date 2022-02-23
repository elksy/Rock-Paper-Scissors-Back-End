import {
  acceptWebSocket,
  acceptable,
  isWebSocketCloseEvent,
} from "https://deno.land/std@0.99.0/ws/mod.ts";
import { v4 } from "https://deno.land/std/uuid/mod.ts";

const handleTournamentWS = async (server, sockets, tournaments) => {
  const uuid = getUserUUID(server);
  const tournamentID = getTournamentID(server);
  const { conn, headers, r: bufReader, w: bufWriter } = server.request;
  const ws = await acceptWebSocket({
    conn,
    headers,
    bufReader,
    bufWriter,
  }).then((ws) => handleEvent(ws, sockets, tournaments, uuid, tournamentID));
};

async function handleEvent(ws, sockets, tournaments, uuid, tournamentID) {
  // Handle the initial connection. Add the players ws to the sockets map and send them the initial tournament data.
  addUserSocket(ws, sockets, uuid, tournamentID);
  sendTournamentBracket(ws, tournaments.get(tournamentID));

  for await (const e of ws) {
    if (isWebSocketCloseEvent(e)) {
      removeWebSocket(sockets, uuid, tournamentID);
      // Need to also update the bracket and maybe replace player with a bot.
      // Right now a close event should only happen once the tournament is finished and we re-direct players to the winners-page
    } else {
      const event = JSON.parse(e);
      updateBracket(event, sockets, tournaments, uuid, tournamentID);
    }
  }
}

async function getUserUUID(server) {
  //   const { uuid } = await server.body;
  // return tournamentID}
  return "33413";
}

async function getTournamentID(server) {
  //   const { tournamentID } = await server.params;
  // return tournamentID
  return 1;
}

function addUserSocket(ws, sockets, uuid, tournamentID) {
  const tournamentSockets = sockets.get(tournamentID);
  tournamentSockets[uuid] = ws;
  sockets.set(tournamentID, tournamentSockets);
}

function sendTournamentBracket(ws, bracket) {
  ws.send(JSON.stringify({ bracket: bracket }));
}

async function updateBracket(event, sockets, tournaments, tournamentID) {
  if ("result" in event) {
    const result = event.result;
    const newBracket = await updateTournamentBracket(
      tournaments,
      tournamentID,
      result // winner round { winner: uuid, round: oeqklewjq}
    );
    const tournamentSockets = sockets.get(tournamentID);
    for (let uuid of tournamentSockets) {
      sendTournamentBracket(uuid.ws, newBracket);
    }

    const startNextRound = startNextRound(newBracket);
    if (startNextRound) {
      // maybe set a timeout here for a few seconds
      for (let uuid of tournamentSockets) {
        sendTournamentBracket(uuid.ws, newBracket);
      }
    }
  }
}

async function updateTournamentBracket(tournaments, tournamentID, result) {
  let currentBracket = tournaments.get(tournamentID);
}

export default handleTournamentWS;

// Should check if all matches from a round and see if they are complete. Send back boolean
//startNextRound()

// takes the result and updates the tournament bracket
// updateTournamentBracket(tournament, tournamentID, result) {

// }
