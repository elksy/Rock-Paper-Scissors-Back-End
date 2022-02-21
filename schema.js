import { Client } from "https://deno.land/x/postgres@v0.15.0/mod.ts";

const config =
  "postgres://zigmyfla:lzPRRaA5v5fKFPNT1hnEkrfNw_UFhPRx@surus.db.elephantsql.com/zigmyfla";
const client = new Client(config);

await client.connect();

await client.queryArray(
  `CREATE TABLE tournaments (
        id SERIAL PRIMARY KEY,
        lobby_code TEXT NOT NULL,
        created_at timestamp with time zone NOT NULL,
        open BOOLEAN,
        players INTEGER NOT NULL
    )`
);

await client.queryArray(
  `CREATE TABLE sessions (
        uuid INTEGER NOT NULL,
        name TEXT NOT NULL,
        tournament_id INTEGER NOT NULL,
        host BOOLEAN,
        created_at timestamp with time zone NOT NULL,
        FOREIGN KEY(tournament_id) REFERENCES tournaments(id)
    )`
);

await client.end();
