import {
  acceptWebSocket,
  isWebSocketCloseEvent,
} from "https://deno.land/std@0.99.0/ws/mod.ts";

const handleTournamentWS = async (
  server,
  sockets,
  tournaments,
  userData,
  tournamentInfo,
  games
) => {
  const uuid = getUserUUID(server);
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
      tournaments,
      uuid,
      tournamentId,
      userData,
      tournamentInfo,
      games
    )
  );
};

async function handleEvent(
  ws,
  sockets,
  tournaments,
  uuid,
  tournamentID,
  userData,
  tournamentInfo,
  games
) {
  addUserSocket(ws, sockets, uuid, tournamentID);
  sendTournamentBracket(ws, tournaments.get(tournamentID));
  setTimeout(() => sendInitialStart(ws), 5000);
  for await (const e of ws) {
    if (isWebSocketCloseEvent(e)) {
      sockets.get(tournamentID).delete(uuid);
      userData.get(tournamentID).delete(uuid);
      if (sockets.get(tournamentID).size === 0) {
        sockets.delete(tournamentID);
        userData.delete(tournamentID);
        tournaments.delete(tournamentID);
        games.delete(tournamentID);
        tournamentInfo.delete(tournamentID);
      }
    } else {
      const event = JSON.parse(e);
      updateBracket(event, sockets, tournaments, tournamentID, userData);
    }
  }
}

function sendInitialStart(ws) {
  ws.send(JSON.stringify({ command: "Start Round" }));
}

async function getUserUUID(server) {
  const { sessionId } = await server.cookies;
  return sessionId;
}

function addUserSocket(ws, sockets, uuid, tournamentID) {
  const tournamentSockets = sockets.get(tournamentID);
  tournamentSockets.set(uuid, ws);
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
      result, // result ={ winner: uuid, round: index, roundMatch: index, score: [score,score]}
      userData
    );
    const tournamentSockets = await sockets.get(tournamentID);
    tournamentSockets.forEach((ws) => {
      ws.send(JSON.stringify({ bracket: newBracket }));
    });

    if (startNextRound(newBracket, result.round)) {
      setTimeout(() => {
        sockets.get(tournamentID).forEach((ws) => {
          ws.send(JSON.stringify({ command: "Start Round" }));
        });
      }, 7000);
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
  for (let i = 0; i < currentBracket[result.round].seeds.length; i++) {
    if (currentBracket[result.round].seeds[i].id === result.seedId) {
      roundMatch = i;
    }
  }
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

  return currentBracket;
}

// Return true or false if the next round should start
function startNextRound(bracket, round) {
  if (round === bracket.length - 1) {
    return true;
  }
  for (let match of bracket[round + 1].seeds) {
    if (match.teams[0].name === "" || match.teams[1].name === "") {
      return false;
    }
  }
  return true;
}

export default handleTournamentWS;
