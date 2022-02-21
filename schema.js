import { Client } from "https://deno.land/x/postgres@v0.15.0/mod.ts";

const config =
  "postgres://zigmyfla:lzPRRaA5v5fKFPNT1hnEkrfNw_UFhPRx@surus.db.elephantsql.com/zigmyfla";
const client = new Client(config);

await client.connect();

await client.queryArray(
  `CREATE TABLE tournaments (
        id SERIAL PRIMARY KEY,
        lobby_code TEXT NOT NULL,
        number_of_rounds INTEGER DEFAULT 3,
        time_limit INTEGER DEFAULT 10,
        add_bots BOOLEAN DEFAULT FALSE,
        tournament_type TEXT DEFAULT 'knockout',
        open BOOLEAN DEFAULT TRUE,
        players INTEGER DEFAULT 1,
        created_at timestamp with time zone NOT NULL,
    )`
);

await client.queryArray(
  `CREATE TABLE sessions (
        uuid INTEGER NOT NULL,
        name TEXT NOT NULL,
        tournament_id INTEGER NOT NULL,
        host BOOLEAN DEFAULT FALSE,
        created_at timestamp with time zone NOT NULL,
        FOREIGN KEY(tournament_id) REFERENCES tournaments(id)
    )`
);

await client.end();
