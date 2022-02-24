import { Application } from "https://deno.land/x/abc@v1.3.3/mod.ts";
import { abcCors } from "https://deno.land/x/cors/mod.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";
import handleWebSocket from "./server-websocket.js";
import handleTournamentWS from "./serverTournamentWs.js";
import { v4 } from "https://deno.land/std/uuid/mod.ts";

// Fetches the environment variables to set up the correct PORT
const DENO_ENV = (await Deno.env.get("DENO_ENV")) ?? "development";
config({ path: `./.env.${DENO_ENV}`, export: true });
const PORT = parseInt(Deno.env.get("PORT"));

// We need to set up a strict cors policy that works for http and websockets
const CorsConfig = {
  methods: "GET",
  origin: "*",
  allowedHeaders: [
    "Authorization",
    "Content-Type",
    "Accept",
    "Origin",
    "User-Agent",
  ],
  credentials: true,
};

const app = new Application();

let sockets = new Map();
// {
// tournamnetID: {
//     uuid: socket,
//     uuid: socket,
//     uuid: socket,
//   }
// }

let tournaments = new Map();
// {
// tournamnetID: ],
// tournamnetID: [tournament bracket data]
// }

let games = new Map();
// {
//     uuid: socket,
//     uuid: socket,
//     uuid: socket,
//   }

let tournamentInfo = new Map();
//  { tournamentId : {
//       rounds: rounds,
//       timeLimit: timeLimit,
//       addBots: addBots,
//       type: type,
//     }
// }

let userData = new Map();
// {
//   tournamentID: {
//     uuid: {
//       name: 'rob',
//       colour: 'green'
//     }
//   }
// }

app.use(abcCors(CorsConfig));
// app.get("/session", (server) => getSession(server));
app.get("/wslobby", (server) => handleWebSocket(server, sockets));

app.get("/wsgame", (server) =>
  handleGamepageWs(games, server, sockets, tournaments)
);

app.get("/wsTournament", (server) =>
  handleTournamentWS(server, sockets, tournaments)
);

app.post("/sessions", (server) => createSession(server));

app.post("/createTournament", (server) => createTournament(server));

app.start({ port: PORT });

console.log(`server listening on http://localhost:${PORT}`);

async function createTournament(server) {
  try {
    const { rounds, timeLimit, addBots, type } = await server.body;
    const tournamentId = v4.generate();
    const tournamentData = {
      rounds: rounds,
      timeLimit: timeLimit,
      addBots: addBots,
      type: type,
    };
    tournamentInfo.set(tournamentId, tournamentData);
    return server.json({ tournamentId: tournamentId }, 200);
  } catch (error) {
    console.log(error);
    return server.json({}, 500);
  }
}

async function createSession(server) {
  const sessionId = v4.generate();

  const userData = {
    playerName: playerName,
    playerColour: playerColour,
    tournamentId: tournamentId,
  };
  sessionInfo.set(sessionId, sessionData);
  const expiryDate = newDate(newDate().getTime() + 7 * 24 * 60 * 60 * 1000);
  await server.setCookie({
    name: "sessionId",
    value: sessionId,
    expires: expiryDate,
    path: "/",
  });
  await server.setCookie({
    name: "playerColour",
    value: playerColour,
    expires: expiryDate,
    path: "/",
  });
  await server.setCookie({
    name: "tournament_id",
    value: tournament_id,
    expires: expiryDate,
    path: "/",
  });
}
