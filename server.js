import { Application } from "https://deno.land/x/abc@v1.3.3/mod.ts";
import { abcCors } from "https://deno.land/x/cors/mod.ts";
import { config } from "https://deno.land/x/dotenv/mod.ts";
import handleWebSocket from "./server-websocket.js";

// Fetches the environment variables to set up the correct PORT
const DENO_ENV = (await Deno.env.get("DENO_ENV")) ?? "development";
config({ path: `./.env.${DENO_ENV}`, export: true });
const PORT = parseInt(Deno.env.get("PORT"));

// We need to set up a strict cors policy that works for http and websockets
const CorsConfig = {
	methods: "GET",
	origin: "*",
	allowedHeaders: ["Authorization", "Content-Type", "Accept", "Origin", "User-Agent"],
	credentials: true,
};

const app = new Application();

app.use(abcCors(CorsConfig));
app.get("/session", (server) => getSession(server));
app.get("/ws", (server) => handleWebSocket(server));
app.start({ port: PORT });

console.log(`server listening on http://localhost:8080`);

function getSession(server) {
	console.log("session");
}
