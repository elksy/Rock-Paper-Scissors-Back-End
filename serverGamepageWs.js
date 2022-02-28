import {
  acceptWebSocket,
  acceptable,
  isWebSocketCloseEvent,
} from "https://deno.land/std@0.99.0/ws/mod.ts";

//send opp choice

const handleGamepageWs = async (games, server, sockets, tournaments) => {
  const uuid = getUserUUID(server);
  //const tournamentID = getTournamentID(server);
  const { conn, headers, r: bufReader, w: bufWriter } = server.request;
  const ws = await acceptWebSocket({
    conn,
    headers,
    bufReader,
    bufWriter,
  }).then((ws) =>
    handleEvent(games, ws, sockets, tournaments, uuid, tournamentID)
  );
};

async function handleEvent(
  games,
  ws,
  sockets,
  tournaments,
  uuid,
  tournamentID
) {
  console.log("wsGame");
  // Handle the initial connection. Add the players ws to the sockets map and send them the initial tournament data.
  addGamesWs(ws, sockets, uuid, tournamentID);

  for await (const e of ws) {
    if (isWebSocketCloseEvent(e)) {
      sockets.delete(uuid);
      sendPlayerInfo(sockets);
    } else {
      const event = JSON.parse(e);
      handlePlayerMove(games, event, uuid, tournaments, tournamentID);
    }
  }
}

function handlePlayerMove(event, uuid, tournaments, tournamentID) {
  if ("option" in event) {
    const opponentId = getOpponentId(event, uuid, tournaments, tournamentID);
    games.get(opponentId).send(event.option);
  }
}

async function getUserUUID(server) {
  //   const { uuid } = await server.body;
  return "33413";
}

function addGamesWs(ws, uuid) {
  // const tournamentSockets = sockets.get(tournamentID);
  // tournamentSockets[uuid] = ws;
  games.set(uuid, ws);
}

function getOpponentId(event, uuid, tournaments, tournamentID) {
  //use uuid to find opp in same tournament bracket
}

export default handleGamepageWs;
