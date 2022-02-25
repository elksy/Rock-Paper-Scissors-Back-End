import {
  acceptWebSocket,
  acceptable,
  isWebSocketCloseEvent,
} from "https://deno.land/std@0.99.0/ws/mod.ts";
import { v4 } from "https://deno.land/std/uuid/mod.ts";

const handleTournamentWS = async (server, sockets, tournaments, userData) => {
  const uuid = getUserUUID(server);
  const { tournamentId } = await server.params;
  const { conn, headers, r: bufReader, w: bufWriter } = server.request;
  const ws = await acceptWebSocket({
    conn,
    headers,
    bufReader,
    bufWriter,
  }).then((ws) =>
    handleEvent(ws, sockets, tournaments, uuid, tournamentId, userData)
  );
};

async function handleEvent(
  ws,
  sockets,
  tournaments,
  uuid,
  tournamentID,
  userData
) {
  addUserSocket(ws, sockets, uuid, tournamentID);
  sendTournamentBracket(ws, tournaments.get(tournamentID));
  setTimeout(() => ws.send(JSON.stringify({ command: "Start Round" }), 5000));
  for await (const e of ws) {
    if (isWebSocketCloseEvent(e)) {
      sockets.get(tournamentID).delete(uuid);
      // Need to also update the bracket and maybe replace player with a bot.
      // Right now a close event should only happen once the tournament is finished and we re-direct players to the winners-page
    } else {
      const event = JSON.parse(e);
      updateBracket(event, sockets, tournaments, uuid, tournamentID, userData);
    }
  }
}

async function getUserUUID(server) {
  //   const { uuid } = await server.body;
  // return tournamentID}
  return "33413";
}

function addUserSocket(ws, sockets, uuid, tournamentID) {
  const tournamentSockets = sockets.get(tournamentID);

  tournamentSockets[uuid] = ws;
  sockets.set(tournamentID, tournamentSockets);
}

function sendTournamentBracket(ws, bracket) {
  ws.send(JSON.stringify({ bracket: bracket }));
}

async function updateBracket(
  event,
  sockets,
  tournaments,
  tournamentID,
  userData
) {
  if ("result" in event) {
    const result = event.result;
    const newBracket = await updateTournamentBracket(
      tournaments,
      tournamentID,
      result, // winner round { winner: uuid, round: index, roundMatch: index, score: [score,score]}
      userData
    );
    const tournamentSockets = sockets.get(tournamentID);
    for (let uuid of tournamentSockets) {
      sendTournamentBracket(uuid.ws, newBracket);
    }

    if (startNextRound(newBracket, result.round)) {
      // maybe set a timeout here for a few seconds
      sockets.get(tournamentID).array.forEach((ws) => {
        ws.send(JSON.stringify({ command: "Start Round" }));
      });
    }
  }
}

export async function updateTournamentBracket(
  tournaments,
  tournamentID,
  result,
  userData
) {
  let currentBracket = await tournaments.get(tournamentID);
  currentBracket[result.round].seeds[result.roundMatch].score = result.score;

  if (result.round < currentBracket.length - 1) {
    currentBracket[result.round + 1].seeds[
      Math.floor(result.roundMatch / 2)
    ].teams[result.roundMatch % 2] = await userData
      .get(tournamentID)
      .get(result.winner);
  }

  if (result.round === currentBracket.length - 1) {
    // endTournament() placeholder func
  }
  return currentBracket;
}

// Return true or false if
function startNextRound(bracket, round) {
  if (round === bracket.length - 1) {
    return true;
  }
  for (match of bracket[round + 1].seeds) {
    if (
      !match.teams[0].hasOwnProperty("name") ||
      !match.teams[1].hasOwnProperty("name")
    ) {
      return false;
    }
  }
  return true;
}

export default handleTournamentWS;
