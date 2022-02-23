import {
	acceptWebSocket,
	acceptable,
	isWebSocketCloseEvent,
} from "https://deno.land/std@0.99.0/ws/mod.ts";

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

function addUserSocket(ws, sockets, uuid, tournamentID) {
	const tournamentSockets = sockets.get(tournamentID);
	tournamentSockets[uuid] = ws;
	sockets.set(tournamentID, tournamentSockets);
}

function getOpponentId(event, uuid, tournaments, tournamentID) {
	//use uuid to find opp in same tournament bracket
}

export default handleWebSocket;
