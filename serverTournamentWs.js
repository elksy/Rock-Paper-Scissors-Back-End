import {
  acceptWebSocket,
  acceptable,
  isWebSocketCloseEvent,
} from "https://deno.land/std@0.99.0/ws/mod.ts";

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
  setTimeout(() => sendInitialStart(ws), 5000);
  for await (const e of ws) {
    if (isWebSocketCloseEvent(e)) {
      sockets.get(tournamentID).delete(uuid);
      // Need to also update the bracket and maybe replace player with a bot.
      // Right now a close event should only happen once the tournament is finished and we re-direct players to the winners-page
    } else {
      const event = JSON.parse(e);
      updateBracket(event, sockets, tournaments, tournamentID, userData);
    }
  }
}

function sendInitialStart(ws) {
  console.log("start");
  ws.send(JSON.stringify({ command: "Start Round" }));
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
    tournamentSockets.forEach((ws) => {
      sendTournamentBracket(ws, newBracket);
    });

    if (startNextRound(newBracket, result.round)) {
      // maybe set a timeout here for a few seconds
      sockets.get(tournamentID).forEach((ws) => {
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

  let roundMatch = null;
  console.log(currentBracket);
  console.log(result.seedId);
  for (let i = 0; i < currentBracket[result.round].seeds.length; i++) {
    if (currentBracket[result.round].seeds[i].id === result.seedId) {
      roundMatch = i;
    }
  }
  console.log(roundMatch);
  const winnerInfo = await userData.get(tournamentID).get(result.winner);
  if (
    currentBracket[result.round].seeds[roundMatch].teams[0].name ===
    winnerInfo.name
  ) {
    currentBracket[result.round].seeds[roundMatch].score = [
      result.playerScore,
      result.opponentScore,
    ];
  } else {
    currentBracket[result.round].seeds[roundMatch].score = [
      result.opponentScore,
      result.playerScore,
    ];
  }

  if (result.round < currentBracket.length - 1) {
    currentBracket[result.round + 1].seeds[Math.floor(roundMatch / 2)].teams[
      roundMatch % 2
    ] = await userData.get(tournamentID).get(result.winner);
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
