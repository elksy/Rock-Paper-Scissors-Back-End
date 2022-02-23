import {
	acceptWebSocket,
	acceptable,
	isWebSocketCloseEvent,
} from "https://deno.land/std@0.99.0/ws/mod.ts";

//get user choice
//send opp choice

const handleGamepageWs = async (games, server, sockets, tournaments) => {
	const uuid = getUserUUID(server);
	const tournamentID = getTournamentID(server);
	const { conn, headers, r: bufReader, w: bufWriter } = server.request;
	const ws = await acceptWebSocket({
		conn,
		headers,
		bufReader,
		bufWriter,
	}).then((ws) => handleEvent(games, ws, sockets, tournaments, uuid, tournamentID));
};

async function handleEvent(games, ws, sockets, tournaments, uuid, tournamentID) {
	// Handle the initial connection. Add the players ws to the sockets map and send them the initial tournament data.
	addUserSocket(ws, sockets, uuid, tournamentID);

	for await (const e of ws) {
		if (isWebSocketCloseEvent(e)) {
			//checks to see if browser closed
			sockets.delete(uuid); //removed key-value pair from map
			sendPlayerInfo(sockets);
		} else {
			const event = JSON.parse(e);
			handlePlayerMove(games, event, sockets, uuid, tournaments, tournamentID);
		}
	}
}

function handlePlayerMove(event, sockets, uuid, tournaments, tournamentID) {
	const opponentId = getOpponentId(event, uuid, tournament, tournamentID);
	games.get(opponentId).send();
}

function addUserSocket(ws, sockets, uuid, tournamentID) {
	const tournamentSockets = sockets.get(tournamentID);
	tournamentSockets[uuid] = ws;
	sockets.set(tournamentID, tournamentSockets);
}

export default handleWebSocket;
